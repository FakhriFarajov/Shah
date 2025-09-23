namespace ShahBuyerAuthApi.Contracts.DTOs.Request;

public record UpsertBuyerRequestDTO(
    string? Name,
    string? Surname,
    string? Email,
    string? Password,
    string? Phone,
    int? CountryCode
);