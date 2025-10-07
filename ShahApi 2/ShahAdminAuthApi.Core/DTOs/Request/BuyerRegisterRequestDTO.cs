namespace ShahAdminAuthApi.Contracts.DTOs.Request;


public record BuyerRegisterRequestDTO(
    string Name,
    string Surname,
    string Email,
    string Password,
    string ConfirmPassword,
    string Phone,
    int CountryCode
);
