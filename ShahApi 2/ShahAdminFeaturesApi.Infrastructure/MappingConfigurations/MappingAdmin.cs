using AutoMapper;
using ShahAdminFeaturesApi.Core.DTOs.Request;
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
        }
    }
}
