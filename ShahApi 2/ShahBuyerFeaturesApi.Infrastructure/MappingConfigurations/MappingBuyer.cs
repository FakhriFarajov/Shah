using AutoMapper;
using ShahBuyerFeaturesApi.Contracts.DTOs.Request;
using ShahBuyerFeaturesApi.Data.Models;

namespace ShahBuyerFeaturesApi.Infrastructure.MappingConfigurations
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {

            CreateMap<AddressRequestDTO, Address>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.BuyerProfile, opt => opt.Ignore())
                .ForMember(dest => dest.Warehouse, opt => opt.Ignore());

            // UpdateAddressRequestDTO -> Address
            CreateMap<UpsertAddressRequestDTO, Address>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
