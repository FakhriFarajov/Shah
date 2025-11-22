using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Services.Classes
{
    public class StatsService : IStatsService
    {
        private readonly ShahDbContext _context;
        public StatsService(ShahDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetWebsiteStatsAsync(int latestCount = 5)
        {
            // All products, variants, and order items in the system
            var productIds = await _context.Products.Select(p => p.Id).ToListAsync();
            var productVariantIds = await _context.ProductVariants.Where(pv => productIds.Contains(pv.ProductId)).Select(pv => pv.Id).ToListAsync();

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
            var totalOrders = await _context.Orders.CountAsync();
            var totalEarnings = orderItemRows.Sum(x => (decimal)x.price * x.quantity);

            // Calculate country percentages for all order items
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

            var totalUsers = await _context.Users.CountAsync();
            var totalBuyers = await _context.BuyerProfiles.CountAsync();
            var totalSellers = await _context.SellerProfiles.CountAsync();
            var totalAdmins = await _context.AdminProfiles.CountAsync();

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
                salesPerYear,
                totalUsers,
                totalBuyers,
                totalSellers,
                totalAdmins
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
