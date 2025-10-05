using AutoMapper;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using ShahSellerAuthApi.Contracts.DTOs.Request;
using ShahSellerAuthApi.Data.Models;

namespace ShahSellerAuthApi.Infrastructure.MappingConfigurations
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // -------------------------
            // Registration Mappings
            // -------------------------

            // SellerRegisterRequestDTO -> User
            CreateMap<SellerRegisterRequestDTO, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => ValidateEmail(src.Email)))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Surname, opt => opt.MapFrom(src => src.Surname))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => ValidatePassword(src.Password, src.ConfirmPassword)))
                .ForMember(dest => dest.SellerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
                .ForMember(dest => dest.RefreshTokenExpiryTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => ShahSellerAuthApi.Data.Enums.Role.Seller));

            // SellerRegisterRequestDTO -> SellerProfile
            CreateMap<SellerRegisterRequestDTO, SellerProfile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.IsVerified, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.StoreInfoId, opt => opt.Ignore())
                .ForMember(dest => dest.StoreInfo, opt => opt.Ignore())
                .ForMember(dest => dest.SellerTaxInfoId, opt => opt.Ignore())
                .ForMember(dest => dest.SellerTaxInfo, opt => opt.Ignore());

            // Optionally, add mappings for StoreInfo and SellerTaxInfo if needed
        }

        // -------------------------
        // Validation & Hashing
        // -------------------------

        private static string ValidateEmail(string email)
        {
            var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (!Regex.IsMatch(email, emailPattern))
                throw new ValidationException("Invalid email format");
            return email;
        }

        private static string ValidatePassword(string password, string confirmPassword)
        {
            var passwordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\W]).{8,}$";

            if (password != confirmPassword)
                throw new ValidationException("Passwords do not match");

            if (!Regex.IsMatch(password, passwordPattern))
                throw new ValidationException("Password must be at least 8 characters long, contain upper and lower case letters, a digit, and a special character");

            return password;
        }
        
    }
}
