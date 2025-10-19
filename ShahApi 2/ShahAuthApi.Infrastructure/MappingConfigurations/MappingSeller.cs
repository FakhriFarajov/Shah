using AutoMapper;
using ShahAuthApi.Core.DTOs.SellerDtos.Request;
using ShahAuthApi.Core.Models;

namespace ShahAuthApi.Infrastructure.MappingConfigurations
{
    public class MappingProfileSeller : Profile
    {
        public MappingProfileSeller()
        {
            // SellerRegisterRequestDTO -> User
            CreateMap<SellerRegisterRequestDTO, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Surname, opt => opt.MapFrom(src => src.Surname))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.CountryCitizenshipId, opt => opt.MapFrom(src => src.CountryCitizenshipId))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password))
                .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshTokenExpiryTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => ShahAuthApi.Core.Enums.Role.Seller))
                .ForMember(dest => dest.SellerProfileId, opt => opt.Ignore())
                .ForMember(dest => dest.SellerProfile, opt => opt.Ignore());

            // SellerRegisterRequestDTO -> SellerProfile
            CreateMap<SellerRegisterRequestDTO, SellerProfile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Passport, opt => opt.MapFrom(src => src.Passport))
                .ForMember(dest => dest.IsVerified, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.StoreInfoId, opt => opt.Ignore())
                .ForMember(dest => dest.StoreInfo, opt => opt.Ignore())
                .ForMember(dest => dest.SellerTaxInfoId, opt => opt.Ignore())
                .ForMember(dest => dest.SellerTaxInfo, opt => opt.Ignore());

            // SellerRegisterRequestDTO -> StoreInfo
            CreateMap<SellerRegisterRequestDTO, StoreInfo>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.StoreName))
                .ForMember(dest => dest.StoreDescription, opt => opt.MapFrom(src => src.StoreDescription))
                .ForMember(dest => dest.StoreEmail, opt => opt.MapFrom(src => src.StoreContactEmail))
                .ForMember(dest => dest.StorePhone, opt => opt.MapFrom(src => src.StoreContactPhone))
                .ForMember(dest => dest.StoreLogo, opt => opt.MapFrom(src => src.StoreLogo))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.AddressId, opt => opt.Ignore())
                .ForMember(dest => dest.Address, opt => opt.Ignore())
                .ForMember(dest => dest.SellerProfileId, opt => opt.Ignore())
                .ForMember(dest => dest.SellerProfile, opt => opt.Ignore());

            // SellerRegisterRequestDTO -> Address
            CreateMap<SellerRegisterRequestDTO, Address>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Street, opt => opt.MapFrom(src => src.Street))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.State))
                .ForMember(dest => dest.PostalCode, opt => opt.MapFrom(src => src.PostalCode))
                .ForMember(dest => dest.CountryId, opt => opt.MapFrom(src => src.StoreCountryCodeId))
                .ForMember(dest => dest.StoreInfoId, opt => opt.Ignore())
                .ForMember(dest => dest.StoreInfo, opt => opt.Ignore());

            // SellerRegisterRequestDTO -> SellerTaxInfo
            CreateMap<SellerRegisterRequestDTO, SellerTaxInfo>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TaxId, opt => opt.MapFrom(src => src.TaxId))
                .ForMember(dest => dest.TaxNumber, opt => opt.MapFrom(src => src.TaxNumber))
                .ForMember(dest => dest.SellerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.SellerProfileId, opt => opt.Ignore());
        }
    }
}