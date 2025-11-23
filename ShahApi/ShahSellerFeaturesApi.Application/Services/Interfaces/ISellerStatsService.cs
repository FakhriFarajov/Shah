using System.Threading.Tasks;

namespace ShahSellerFeaturesApi.Application.Services.Interfaces
{
    public interface ISellerStatsService
    {
        Task<object> GetSellerStatsAsync(string sellerId, int latestCount = 5);
    }
}