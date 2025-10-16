using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace ShahAdminAuthApi.Infrastructure.Contexts
{
    public class ShahDbContextFactory : IDesignTimeDbContextFactory<ShahDbContext>
    {
        public ShahDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<ShahDbContext>();
            optionsBuilder.UseSqlServer(configuration.GetConnectionString("Mac"));

            return new ShahDbContext(optionsBuilder.Options);
        }
    }
}

