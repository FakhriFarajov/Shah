namespace ShahBuyerFeaturesApi.Core.DTOs.Request;

public record UpsertAddressRequestDTO(
    string? Id,
    string? BuyerId,
    string? Street,
    string? City,
    string? State,
    string? PostalCode,
    int? CountryId,
    string? StoreId,
    string? WarehouseId
);