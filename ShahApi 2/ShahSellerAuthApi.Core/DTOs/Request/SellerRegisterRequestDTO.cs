using ShahSellerAuthApi.Data.Enums;

namespace ShahSellerAuthApi.Contracts.DTOs.Request;


public record SellerRegisterRequestDTO(
    string Name,
    string Surname,
    string Email,
    string Phone,
    string Passport,
    int CountryCitizenship,
    string Password,
    string ConfirmPassword,
    string StoreLogoUrl,
    string StoreName,
    string StoreDescription,
    string StoreContactPhone,
    string StoreContactEmail,
    int TaxId,
    string TaxIdNumber,
    string Street,
    string City,
    string State,
    string PostalCode,
    int StoreCountryCode,
    string? CategoryId
);
