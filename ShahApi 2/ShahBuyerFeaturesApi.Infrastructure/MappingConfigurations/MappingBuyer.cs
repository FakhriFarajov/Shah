using AutoMapper;
using ShahBuyerFeaturesApi.Contracts.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Request;
using ShahBuyerFeaturesApi.Core.DTOs.Response;
using ShahBuyerFeaturesApi.Core.Enums;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.MappingConfigurations
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AddAddressRequestDTO, Address>()
                .ForMember(dest => dest.Street, opt => opt.MapFrom(src => src.Street))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.State))
                .ForMember(dest => dest.PostalCode, opt => opt.MapFrom(src => src.PostalCode))
                .ForMember(dest => dest.CountryId, opt => opt.MapFrom(src => src.CountryId))
                .ForMember(dest => dest.BuyerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.StoreInfo, opt => opt.Ignore())
                .ForMember(dest => dest.Warehouse, opt => opt.Ignore())
                .ForMember(dest => dest.Country, opt => opt.Ignore());
            
            CreateMap<EditAddressRequestDTO, Address>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.AddressId))
                .ForMember(dest => dest.Street, opt => opt.MapFrom(src => src.Street))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.State))
                .ForMember(dest => dest.PostalCode, opt => opt.MapFrom(src => src.PostalCode))
                .ForMember(dest => dest.CountryId, opt => opt.MapFrom(src => src.CountryId))
                .ForMember(dest => dest.BuyerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.StoreInfo, opt => opt.Ignore())
                .ForMember(dest => dest.Warehouse, opt => opt.Ignore());
            
            
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
