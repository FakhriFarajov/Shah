using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShahSellerFeaturesApi.Application.Services.Interfaces;
using ShahSellerFeaturesApi.Infrastructure.Contexts;

namespace ShahSellerFeaturesApi.Application.Services.Classes
{
    public class SellerStatsService : ISellerStatsService
    {
        private readonly ShahDbContext _context;
        public SellerStatsService(ShahDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetSellerStatsAsync(string sellerId, int latestCount = 5)
        {
            var storeInfoId = await _context.SellerProfiles
                .Where(s => s.UserId == sellerId)
                .Select(s => s.StoreInfoId)
                .FirstOrDefaultAsync();

            var productIds = await _context.Products
                .Where(p => p.StoreInfoId == storeInfoId)
                .Select(p => p.Id)
                .ToListAsync();

            var productVariantIds = await _context.ProductVariants
                .Where(pv => productIds.Contains(pv.ProductId))
                .Select(pv => pv.Id)
                .ToListAsync();

            // Get all order items for these product variants
            var orderItemsQuery = _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv.Images)
                .Where(oi => productVariantIds.Contains(oi.ProductVariantId));

            var orderItemRows = await orderItemsQuery
                .OrderByDescending(oi => oi.Order.CreatedAt)
                .Take(latestCount)
                .Select(oi => new {
                    orderId = oi.Order.Id,
                    orderDate = oi.Order.CreatedAt,
                    paymentStatus = oi.Status.ToString(),
                    productName = oi.ProductVariant.Title,
                    productImage = oi.ProductVariant.Images.OrderBy(img => img.IsMain ? 0 : 1).ThenBy(img => img.Id).Select(img => img.ImageUrl).FirstOrDefault(),
                    price = oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price ? oi.ProductVariant.DiscountPrice : oi.ProductVariant.Price,
                    quantity = oi.Quantity,
                    order = new {
                        oi.Order.Id,
                        oi.Order.CreatedAt,
                        oi.Order.TotalAmount,
                        oi.Order.BuyerProfileId
                    }
                })
                .ToListAsync();

            var totalProducts = productIds.Count;
            var totalOrders = await _context.Orders
                .Where(o => o.OrderItems.Any(oi => productVariantIds.Contains(oi.ProductVariantId)))
                .CountAsync();

            var totalEarnings = orderItemRows.Sum(x => (decimal)x.price * x.quantity);

            // Calculate country percentages for the seller's order items
            var countryNames = await orderItemsQuery
                .Select(oi => oi.Order.BuyerProfile.Address.Country.Name)
                .Where(name => name != null)
                .ToListAsync();
            var totalCountryCount = countryNames.Count;
            var topCountries = countryNames
                .GroupBy(name => name)
                .Select(g => new {
                    name = g.Key,
                    percent = totalCountryCount > 0 ? (int)Math.Round(100.0 * g.Count() / totalCountryCount) : 0
                })
                .OrderByDescending(g => g.percent)
                .ToList();

            // Sales per day
            var salesPerDay = await orderItemsQuery
                .GroupBy(oi => oi.Order.CreatedAt.Date)
                .Select(g => new {
                    date = g.Key,
                    sales = g.Sum(oi => (oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price ? oi.ProductVariant.DiscountPrice : oi.ProductVariant.Price) * oi.Quantity)
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            // Sales per week (group by start of week in-memory)
            var salesPerWeek = salesPerDay
                .GroupBy(x => FirstDayOfWeek(x.date))
                .Select(g => new {
                    weekStart = g.Key,
                    sales = g.Sum(x => x.sales)
                })
                .OrderBy(x => x.weekStart)
                .ToList();

            // Sales per month
            var salesPerMonth = await orderItemsQuery
                .GroupBy(oi => new { oi.Order.CreatedAt.Year, oi.Order.CreatedAt.Month })
                .Select(g => new {
                    year = g.Key.Year,
                    month = g.Key.Month,
                    sales = g.Sum(oi => (oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price ? oi.ProductVariant.DiscountPrice : oi.ProductVariant.Price) * oi.Quantity)
                })
                .OrderBy(x => x.year).ThenBy(x => x.month)
                .ToListAsync();

            // Sales per year
            var salesPerYear = await orderItemsQuery
                .GroupBy(oi => oi.Order.CreatedAt.Year)
                .Select(g => new {
                    year = g.Key,
                    sales = g.Sum(oi => (oi.ProductVariant.DiscountPrice > 0 && oi.ProductVariant.DiscountPrice < oi.ProductVariant.Price ? oi.ProductVariant.DiscountPrice : oi.ProductVariant.Price) * oi.Quantity)
                })
                .OrderBy(x => x.year)
                .ToListAsync();

            return new
            {
                orderItemRows,
                totalProducts,
                totalOrders,
                totalEarnings,
                topCountries,
                salesPerDay,
                salesPerWeek,
                salesPerMonth,
                salesPerYear
            };
        }

        // Helper to get the first day of the week (Monday) for a given date
        private static DateTime FirstDayOfWeek(DateTime date)
        {
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }

    }
}
