namespace ShahAdminFeaturesApi.Core.DTOs.Request
{
    public class CreateWarehouseRequestDTO
    {
        public WarehouseAddressDTO? Address { get; set; }
        public int Capacity { get; set; }
    }
}
