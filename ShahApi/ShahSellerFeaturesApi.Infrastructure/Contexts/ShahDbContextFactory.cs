using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ShahSellerFeaturesApi.Infrastructure.Contexts
{
    public class ShahDbContextFactory : IDesignTimeDbContextFactory<ShahDbContext>
    {
        public ShahDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ShahDbContext>();
            // Use your connection string here or from environment variable
            optionsBuilder.UseSqlServer("Data Source=localhost; Initial Catalog=ShahDatabase; User Id=sa; Password=Password_123; Trust Server Certificate=True");
            return new ShahDbContext(optionsBuilder.Options);
        }
    }
}

