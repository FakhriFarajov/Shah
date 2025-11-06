using AutoMapper;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using ShahAdminFeaturesApi.Core.Models;

namespace ShahAdminFeaturesApi.Infrastructure.MappingConfigurations
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AddAdminRequestDTO, User>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Surname, opt => opt.MapFrom(src => src.Surname))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.CountryCitizenshipId, opt => opt.MapFrom(src => src.CountryCitizenshipId))
                .ForMember(dest => dest.EmailConfirmed, opt => opt.Ignore()) // Default value
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => "Admin")) // Set role to Admin
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()); // Will be set automatically

            CreateMap<AddAdminRequestDTO, AdminProfile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Will be set automatically
                .ForMember(dest => dest.UserId, opt => opt.Ignore()); // Will be set
            
            
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
            
            
            CreateMap<SellerProfile, SellerProfileResponseDTO>()
                // User (non-nullable in model)
                .ForMember(d => d.Name, o => o.MapFrom(s => s.User.Name))
                .ForMember(d => d.Surname, o => o.MapFrom(s => s.User.Surname))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email))
                .ForMember(d => d.Phone, o => o.MapFrom(s => s.User.Phone))
                .ForMember(d => d.EmailConfirmed, o => o.MapFrom(s => s.User.EmailConfirmed))
                // Passport should come directly from SellerProfile
                .ForMember(d => d.PassportNumber, o => o.MapFrom(s => s.Passport))
                .ForMember(d => d.CountryCitizenshipId, o => o.MapFrom(s => s.User.CountryCitizenshipId))
                .ForMember(d => d.IsVerified, o => o.MapFrom(s => s.IsVerified))
                // StoreInfo (nullable)
                .ForMember(d => d.StoreLogo, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreLogo : null))
                .ForMember(d => d.StoreName, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreName : string.Empty))
                .ForMember(d => d.StoreDescription, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreDescription : string.Empty))
                .ForMember(d => d.StoreContactPhone, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StorePhone : string.Empty))
                .ForMember(d => d.StoreContactEmail, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreEmail : string.Empty))
                .ForMember(d => d.CategoryId, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.CategoryId : null))
                // SellerTaxInfo (nullable)
                .ForMember(d => d.TaxId, o => o.MapFrom(s => s.SellerTaxInfo != null ? s.SellerTaxInfo.TaxId : 0))
                .ForMember(d => d.TaxNumber, o => o.MapFrom(s => s.SellerTaxInfo != null ? s.SellerTaxInfo.TaxNumber : string.Empty))
                // Address via StoreInfo.Address (nullable)
                .ForMember(d => d.Street, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.Street : string.Empty))
                .ForMember(d => d.City, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.City : string.Empty))
                .ForMember(d => d.State, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.State : string.Empty))
                .ForMember(d => d.PostalCode, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.PostalCode : string.Empty))
                .ForMember(d => d.StoreCountryCodeId, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.CountryId : 0));

            // Prefill edit form: map entity -> EditSellerRequestDTO, using null for missing nested data
            CreateMap<SellerProfile, EditSellerRequestDTO>()
                // User
                .ForMember(d => d.Name, o => o.MapFrom(s => s.User.Name))
                .ForMember(d => d.Surname, o => o.MapFrom(s => s.User.Surname))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email))
                .ForMember(d => d.Phone, o => o.MapFrom(s => s.User.Phone))
                .ForMember(d => d.CountryCitizenshipId, o => o.MapFrom(s => (int?)s.User.CountryCitizenshipId))
                // Passport
                .ForMember(d => d.PassportNumber, o => o.MapFrom(s => s.Passport))
                // Removed passport mapping as it’s managed in Admin API
                // StoreInfo
                .ForMember(d => d.StoreLogo, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreLogo : null))
                .ForMember(d => d.StoreName, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreName : null))
                .ForMember(d => d.StoreDescription, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreDescription : null))
                .ForMember(d => d.StoreContactPhone, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StorePhone : null))
                .ForMember(d => d.StoreContactEmail, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.StoreEmail : null))
                .ForMember(d => d.CategoryId, o => o.MapFrom(s => s.StoreInfo != null ? s.StoreInfo.CategoryId : null))
                // SellerTaxInfo
                .ForMember(d => d.TaxId, o => o.MapFrom(s => s.SellerTaxInfo != null ? (int?)s.SellerTaxInfo.TaxId : null))
                .ForMember(d => d.TaxNumber, o => o.MapFrom(s => s.SellerTaxInfo != null ? s.SellerTaxInfo.TaxNumber : null))
                // Address via StoreInfo.Address
                .ForMember(d => d.Street, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.Street : null))
                .ForMember(d => d.City, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.City : null))
                .ForMember(d => d.State, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.State : null))
                .ForMember(d => d.PostalCode, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? s.StoreInfo.Address.PostalCode : null))
                .ForMember(d => d.StoreCountryCodeId, o => o.MapFrom(s => s.StoreInfo != null && s.StoreInfo.Address != null ? (int?)s.StoreInfo.Address.CountryId : null));

            // Helper: skip null/empty strings and null values
            bool ShouldMap(object srcMember) => srcMember switch
            {
                null => false,
                string s => !string.IsNullOrWhiteSpace(s),
                _ => true
            };

            // DTO -> Entities for partial update in service
            var userMap = CreateMap<EditSellerRequestDTO, User>();
            userMap.ForAllMembers(opt => opt.Condition((src, dest, srcMember, ctx) => ShouldMap(srcMember)));
            userMap.ForMember(d => d.CountryCitizenshipId, o => o.Condition((src, dest, srcMember, ctx) => src.CountryCitizenshipId.HasValue));

            var storeMap = CreateMap<EditSellerRequestDTO, StoreInfo>();
            storeMap.ForAllMembers(opt => opt.Condition((src, dest, srcMember, ctx) => ShouldMap(srcMember)));
            storeMap.ForMember(d => d.StorePhone, o => o.MapFrom(s => s.StoreContactPhone))
                    .ForMember(d => d.StoreEmail, o => o.MapFrom(s => s.StoreContactEmail))
                    .ForMember(d => d.StoreLogo, o => o.Ignore());

            var addrMap = CreateMap<EditSellerRequestDTO, Address>();
            addrMap.ForAllMembers(opt => opt.Condition((src, dest, srcMember, ctx) => ShouldMap(srcMember)));
            addrMap.ForMember(d => d.CountryId, o => o.MapFrom(s => s.StoreCountryCodeId));

            var taxMap = CreateMap<EditSellerRequestDTO, SellerTaxInfo>();
            taxMap.ForAllMembers(opt => opt.Condition((src, dest, srcMember, ctx) => ShouldMap(srcMember)));
            taxMap.ForMember(d => d.TaxId, o => o.Condition((src, dest, srcMember, ctx) => src.TaxId.HasValue));
        }
    }
}
