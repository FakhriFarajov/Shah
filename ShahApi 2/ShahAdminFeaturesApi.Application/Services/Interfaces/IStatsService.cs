using System.Threading.Tasks;

namespace ShahAdminFeaturesApi.Application.Services.Interfaces
{
    public interface IStatsService
    {
        Task<object> GetWebsiteStatsAsync(int latestCount = 5);
    }
}