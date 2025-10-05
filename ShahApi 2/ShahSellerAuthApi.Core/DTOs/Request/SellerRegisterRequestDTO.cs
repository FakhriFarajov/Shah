using ShahSellerAuthApi.Data.Enums;

namespace ShahSellerAuthApi.Contracts.DTOs.Request;


public record SellerRegisterRequestDTO(
    string Name,
    string Surname,
    string Email,
    string Phone,
    string Passport,
    Country CountryCode,
    string Password,
    string ConfirmPassword,
    string ImageUrl,
    string StoreName,
    string StoreDescription,
    string StoreEmail,
    string StorePhone,
    TaxIdType TaxIdType,
    string TaxId,
    string Street,
    string City,
    string State,
    string ZipCode,
    Country StoreCountryCode,
    string CategoryId
);
