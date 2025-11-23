namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class UpdateWarehouseRequestDTO
    {
        public WarehouseAddressDTO? Address { get; set; }
        public int? Capacity { get; set; }
    }
}
