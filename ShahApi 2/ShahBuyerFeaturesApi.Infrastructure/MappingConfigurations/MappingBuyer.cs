using AutoMapper;
using ShahBuyerFeaturesApi.Contracts.DTOs.Request;
using ShahBuyerFeaturesApi.Core.Enums;
using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.MappingConfigurations
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Insert or Update address
            CreateMap<UpsertAddressRequestDTO, Address>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.BuyerProfileId, opt => opt.MapFrom(src => src.BuyerId))
                .ForMember(dest => dest.Street, opt => opt.MapFrom(src => src.Street))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.State))
                .ForMember(dest => dest.PostalCode, opt => opt.MapFrom(src => src.PostalCode))
                .ForMember(dest => dest.Country, opt => opt.MapFrom(src => src.CountryCode.HasValue ? (Country)src.CountryCode.Value : default))
                .ForMember(dest => dest.StoreInfoId, opt => opt.MapFrom(src => src.StoreId))
                .ForMember(dest => dest.WarehouseId, opt => opt.MapFrom(src => src.WarehouseId))
                .ForMember(dest => dest.BuyerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.StoreInfo, opt => opt.Ignore())
                .ForMember(dest => dest.Warehouse, opt => opt.Ignore());

            CreateMap<UpsertOrderPaymentRequestDTO, OrderPayment>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.TotalAmount))
                .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency))
                .ForMember(dest => dest.Method, opt => opt.MapFrom(src => (PaymentMethod)src.Method))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (PaymentStatus)src.Status))
                .ForMember(dest => dest.GatewayTransactionId, opt => opt.MapFrom(src => src.GatewayTransactionId))
                .ForMember(dest => dest.RefundAmount, opt => opt.MapFrom(src => src.RefundAmount))
                .ForMember(dest => dest.RefundReason, opt => opt.MapFrom(src => src.RefundReason))
                .ForMember(dest => dest.BuyerProfileId, opt => opt.MapFrom(src => src.BuyerProfileId))
                .ForMember(dest => dest.BuyerProfile, opt => opt.Ignore());
        }
    }
}
