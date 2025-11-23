using AutoMapper;
using ShahAuthApi.Core.DTOs.BuyerDtos.Request;
using ShahAuthApi.Core.Models;

namespace ShahAuthApi.Infrastructure.MappingConfigurations
{
    public class MappingProfileBuyer : Profile
    {
        public MappingProfileBuyer()
        {
            // -------------------------
            // Registration Mappings
            // -------------------------

            // BuyerRegisterRequestDTO -> User
            CreateMap<BuyerRegisterRequestDTO, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Surname, opt => opt.MapFrom(src => src.Surname))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password))
                .ForMember(dest => dest.CountryCitizenshipId, opt => opt.MapFrom(src => src.CountryCitizenshipId))
                .ForMember(dest => dest.BuyerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshTokenExpiryTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Core.Enums.Role.Buyer));

            // BuyerRegisterRequestDTO -> BuyerProfile
            CreateMap<BuyerRegisterRequestDTO, BuyerProfile>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Address, opt => opt.Ignore())
                .ForMember(dest => dest.Favorites, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore())
                .ForMember(dest => dest.Reviews, opt => opt.Ignore())
                .ForMember(dest => dest.CartItems, opt => opt.Ignore())
                .ForMember(dest => dest.OrderPayment, opt => opt.Ignore());
        }

        
        
    }
}
