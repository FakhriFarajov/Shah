using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ShahBuyerFeaturesApi.Application.Services.Interfaces;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Infrastructure.Contexts;

namespace ShahBuyerFeaturesApi.Application.Services.Classes
{
    public class PdfReceiptService : IPdfReceiptService
    {
        private readonly ShahDbContext _db;
        private readonly IMinioClient _minio;
        private readonly string _bucket;
        private readonly string _minioHost;
        private readonly IEmailService _emailService;
        private readonly ILogger<PdfReceiptService> _logger;

        public PdfReceiptService(ShahDbContext db, IConfiguration config, IEmailService emailService, ILogger<PdfReceiptService> logger)
        {
            _db = db;
            _emailService = emailService;
            _logger = logger;
            _minioHost = config["Minio:Host"] ?? "localhost:9000";
            _minio = new MinioClient()
                .WithEndpoint(_minioHost)
                .WithCredentials(config["Minio:AccessKey"], config["Minio:SecretKey"]).Build();
            var receiptBucket = config["Minio:ReceiptBucketName"];
            _bucket = !string.IsNullOrWhiteSpace(receiptBucket)
                ? receiptBucket
                : (config["Minio:BucketName"] ?? throw new ArgumentNullException("Minio:BucketName", "Minio bucket not configured"));

            // QuestPDF license (Community)
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<TypedResult<object>> GenerateAndSaveReceiptAsync(string orderId, string buyerProfileId)
        {
            if (string.IsNullOrWhiteSpace(orderId))
                return TypedResult<object>.Error("orderId is required");
            if (string.IsNullOrWhiteSpace(buyerProfileId))
                return TypedResult<object>.Error("buyerProfileId is required");

            _logger.LogInformation("Generating receipt for Order {OrderId} (Buyer {BuyerId}) to bucket {Bucket}", orderId, buyerProfileId, _bucket);

            // Load order with necessary relations (tracked to allow updates)
            var order = await _db.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.ProductVariant)
                .Include(o => o.BuyerProfile).ThenInclude(bp => bp.User)
                .Include(o => o.Receipt)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerProfileId == buyerProfileId);

            if (order == null)
                return TypedResult<object>.Error("Order not found", 404);

            // Local helper to extract object name from stored value (full url | object name | filename)
            string ExtractObjectName(string stored)
            {
                if (string.IsNullOrWhiteSpace(stored)) return stored;

                var bucketMarker = $"/{_bucket}/";
                var idx = stored.IndexOf(bucketMarker, StringComparison.OrdinalIgnoreCase);
                if (idx >= 0)
                {
                    return stored.Substring(idx + bucketMarker.Length);
                }

                var receiptsIdx = stored.IndexOf("receipts/", StringComparison.OrdinalIgnoreCase);
                if (receiptsIdx >= 0)
                {
                    return stored.Substring(receiptsIdx);
                }

                return stored.Contains('/') ? stored.Split('/').Last() : stored;
            }

            string ToPublicUrl(string objectName)
            {
                var scheme = _minioHost.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? string.Empty : "http://";
                var baseHost = _minioHost.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? _minioHost : scheme + _minioHost;
                return $"{baseHost}/{_bucket}/{objectName}";
            }

            // If a real receipt already exists, ensure Order.ReceiptId set and return normalized object name
            if (order.Receipt != null && !string.IsNullOrWhiteSpace(order.Receipt.File))
            {
                if (string.IsNullOrWhiteSpace(order.ReceiptId) || order.ReceiptId != order.Receipt.Id)
                {
                    order.ReceiptId = order.Receipt.Id;
                    order.UpdatedAt = DateTime.UtcNow;
                    _db.Orders.Update(order);
                    await _db.SaveChangesAsync();
                }

                // Normalize stored File to object name (key)
                var normalizedObjectName = ExtractObjectName(order.Receipt.File);
                if (!string.Equals(order.Receipt.File, normalizedObjectName, StringComparison.Ordinal))
                {
                    order.Receipt.File = normalizedObjectName;
                    _db.Receipts.Update(order.Receipt);
                }

                await _db.SaveChangesAsync();

                var fileKey = normalizedObjectName;
                var fileName = fileKey.Contains('/') ? fileKey.Split('/').Last() : fileKey;
                var fileUrl = ToPublicUrl(fileKey);

                _logger.LogInformation("Order {OrderId} already has a receipt {ReceiptId}", order.Id, order.Receipt.Id);
                return TypedResult<object>.Success(new
                {
                    orderReceiptId = order.Receipt.Id,
                    fileKey,
                    fileName,
                    fileUrl,
                    order.Receipt.IssuedAt,
                    order.TotalAmount,
                    EmailSent = (bool?)null
                }, "Receipt already exists");
            }

            // Build PDF bytes
            var now = DateTime.UtcNow;
            // We store only the object name (acts as filename/key in MinIO)
            var objectName = $"receipts/{order.Id}-{now:yyyyMMddHHmmss}.pdf";

            byte[] pdfBytes = BuildReceiptPdf(order.Id, now, order.TotalAmount, order.OrderItems.Select(i => new ItemRow
            {
                Title = i.ProductVariant.Title,
                UnitPrice = i.ProductVariant.Price,
                Quantity = i.Quantity
            }).ToList());

            // Ensure bucket exists
            bool exists = await _minio.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucket));
            if (!exists)
            {
                _logger.LogInformation("Bucket {Bucket} not found. Creating...", _bucket);
                await _minio.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucket));
            }

            await using (var ms = new MemoryStream(pdfBytes))
            {
                var putArgs = new PutObjectArgs()
                    .WithBucket(_bucket)
                    .WithObject(objectName)
                    .WithStreamData(ms)
                    .WithObjectSize(ms.Length)
                    .WithContentType("application/pdf");
                await _minio.PutObjectAsync(putArgs);
                _logger.LogInformation("Uploaded receipt PDF to {Bucket}/{Object}", _bucket, objectName);
            }

            // Construct a public URL for email/display if needed; but we persist only the object name
            var scheme = _minioHost.StartsWith("http") ? string.Empty : "http://";
            var baseHost = _minioHost.StartsWith("http") ? _minioHost : scheme + _minioHost;
            var publicUrl = $"{baseHost}/{_bucket}/{objectName}";

            // Persist or update Receipt, storing only the object name in File
            Core.Models.Receipt receipt;
            if (order.Receipt == null)
            {
                receipt = new Core.Models.Receipt
                {
                    Amount = order.TotalAmount,
                    File = objectName,
                    IssuedAt = DateTime.UtcNow
                };
                _db.Receipts.Add(receipt);
                await _db.SaveChangesAsync(); // insert receipt

                order.ReceiptId = receipt.Id;
                order.Receipt = receipt;
                order.UpdatedAt = DateTime.UtcNow;
                _db.Orders.Update(order);
            }
            else
            {
                receipt = order.Receipt;
                receipt.Amount = order.TotalAmount;
                receipt.File = objectName;
                receipt.IssuedAt = DateTime.UtcNow;
                _db.Receipts.Update(receipt);
                if (order.ReceiptId != receipt.Id)
                {
                    order.ReceiptId = receipt.Id;
                }
                order.UpdatedAt = DateTime.UtcNow;
                _db.Orders.Update(order);
            }
            await _db.SaveChangesAsync();

            bool emailSent = false;
            string? emailError = null;
            try
            {
                var email = order.BuyerProfile?.User?.Email;
                if (!string.IsNullOrWhiteSpace(email))
                {
                    var subject = $"Your receipt for order {order.Id}";
                    var buyerName = order.BuyerProfile?.User?.Name ?? "Customer";
                    var body = $"Hello {buyerName},\n\nAttached is your receipt for order {order.Id} placed on {now:yyyy-MM-dd}.\nTotal: {order.TotalAmount:0.00}.\n\nYou can also access it at: {publicUrl}\n\nThank you!";
                    await _emailService.SendAsync(email, subject, body, $"receipt-{order.Id}.pdf", pdfBytes, "application/pdf");
                    emailSent = true;
                    _logger.LogInformation("Emailed receipt for Order {OrderId} to {Email}", order.Id, email);
                }
                else
                {
                    _logger.LogWarning("Buyer email missing for Order {OrderId}", order.Id);
                }
            }
            catch (Exception ex)
            {
                emailError = ex.Message;
                _logger.LogError(ex, "Failed to send receipt email for Order {OrderId}", order.Id);
            }

            return TypedResult<object>.Success(new
            {
                orderReceiptId = receipt.Id,
                fileKey = objectName,
                fileName = (objectName.Contains('/') ? objectName.Split('/').Last() : objectName),
                fileUrl = publicUrl,
                receipt.IssuedAt,
                Amount = receipt.Amount,
                EmailSent = emailSent,
                EmailError = emailError
            }, emailSent ? "Receipt generated and emailed" : "Receipt generated; email not sent");
        }

        private record ItemRow
        {
            public string Title { get; init; }
            public decimal UnitPrice { get; init; }
            public int Quantity { get; init; }
            public decimal LineTotal => UnitPrice * Quantity;
        }

        private static byte[] BuildReceiptPdf(string orderId, DateTime issuedAtUtc, decimal total, IList<ItemRow> items)
        {
            using var ms = new MemoryStream();

            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);

                    page.Header()
                        .Text($"Receipt")
                        .SemiBold().FontSize(18).FontColor(Colors.Blue.Medium);

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);
                        col.Item().Text($"Order ID: {orderId}");
                        col.Item().Text($"Issued At (UTC): {issuedAtUtc:yyyy-MM-dd HH:mm:ss}");

                        col.Item().LineHorizontal(0.5f);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(6); // Title
                                columns.RelativeColumn(2); // Qty
                                columns.RelativeColumn(2); // Price
                                columns.RelativeColumn(2); // Total
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Item").SemiBold();
                                header.Cell().Text("Qty").SemiBold();
                                header.Cell().Text("Unit").SemiBold();
                                header.Cell().Text("Total").SemiBold();
                            });

                            foreach (var it in items)
                            {
                                table.Cell().Text(it.Title);
                                table.Cell().Text(it.Quantity.ToString());
                                table.Cell().Text(it.UnitPrice.ToString("0.00"));
                                table.Cell().Text(it.LineTotal.ToString("0.00"));
                            }
                        });

                        col.Item().LineHorizontal(0.5f);
                        col.Item().AlignRight().Text($"Grand Total: {total:0.00}").Bold();
                    });

                    page.Footer().AlignCenter().Text("Thank you for your purchase!").FontSize(10);
                });
            })
            .GeneratePdf(ms);

            return ms.ToArray();
        }
    }
}
