using AutoMapper;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Core.Models;

namespace ShahAdminAuthApi.Infrastructure.MappingConfigurations
{
    public class Mapping : Profile
    {
        public Mapping()
        {
            // -------------------------
            // Registration Mappings
            // -------------------------

            // AdminRegisterRequestDTO -> User
            CreateMap<AdminRegisterRequestDTO, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Surname, opt => opt.MapFrom(src => src.Surname))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.CountryCitizenship, opt => opt.MapFrom(src => src.CountryCitizenship))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => ShahAdminAuthApi.Core.Enums.Role.Admin))
                .ForMember(dest => dest.AdminProfile, opt => opt.Ignore())
                .ForMember(dest => dest.AdminProfileId, opt => opt.Ignore())
                .ForMember(dest => dest.BuyerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.BuyerProfileId, opt => opt.Ignore())
                .ForMember(dest => dest.SellerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.SellerProfileId, opt => opt.Ignore())
                .ForMember(dest => dest.EmailConfirmed, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshTokenExpiryTime, opt => opt.Ignore());

            // AdminRegisterRequestDTO -> AdminProfile
            CreateMap<AdminRegisterRequestDTO, AdminProfile>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());
        }
        
        
    }
}
