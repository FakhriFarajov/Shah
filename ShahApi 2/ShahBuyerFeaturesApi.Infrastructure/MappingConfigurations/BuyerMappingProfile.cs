using AutoMapper;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Enums;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.MappingConfigurations
{
    public class BuyerMappingProfile : Profile
    {
        public BuyerMappingProfile()
        {
            // BuyerProfile -> BuyerProfileResponseDTO (flatten nested User) with null checks
            CreateMap<BuyerProfile, BuyerProfileResponseDTO>()
                .ForMember(d => d.Id, o => o.MapFrom(s => s.Id))
                .ForMember(d => d.ImageProfile, o => o.MapFrom(s => s.ImageProfile)) // we'll replace with URL in service
                .ForMember(d => d.AddressId, o => o.MapFrom(s => s.AddressId))
                .ForMember(d => d.UserId, o => o.MapFrom(s => s.UserId))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.User == null ? null : s.User.Email))
                .ForMember(d => d.IsEmailConfirmed, o => o.MapFrom(s => s.User == null ? false : s.User.EmailConfirmed))
                .ForMember(d => d.Name, o => o.MapFrom(s => s.User == null ? null : s.User.Name))
                .ForMember(d => d.Surname, o => o.MapFrom(s => s.User == null ? null : s.User.Surname))
                .ForMember(d => d.Phone, o => o.MapFrom(s => s.User == null ? null : s.User.Phone))
                .ForMember(d => d.CountryCitizenshipId, o => o.MapFrom(s => s.User == null ? (int?)null : s.User.CountryCitizenshipId))
                .ForMember(d => d.createdAt, o => o.MapFrom(s => s.User == null ? default(DateTime) : s.User.CreatedAt));
        }
    }
}
