namespace ShahAuthApi.Core.DTOs.SellerDtos.Request;


public record SellerRegisterRequestDTO(
    string Name,
    string Surname,
    string Email,
    string Phone,
    string Passport,
    int CountryCitizenshipId,
    string Password,
    string ConfirmPassword,
    string? StoreLogo,
    string StoreName,
    string StoreDescription,
    string StoreContactPhone,
    string StoreContactEmail,
    int TaxId,
    string TaxNumber,
    string Street,
    string City,
    string State,
    string PostalCode,
    int StoreCountryCodeId,
    string? CategoryId
);
