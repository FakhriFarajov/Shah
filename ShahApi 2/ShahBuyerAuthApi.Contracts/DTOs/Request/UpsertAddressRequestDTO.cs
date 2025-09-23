namespace ShahBuyerAuthApi.Contracts.DTOs.Request;

public record UpsertAddressRequestDTO(
    string? Id,
    string? BuyerId,
    string? Street,
    string? City,
    string? State,
    string? PostalCode,
    int? CountryCode
);