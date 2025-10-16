using ShahAdminAuthApi.Core.Enums;

namespace ShahAdminAuthApi.Contracts.DTOs.Request;


public record AdminRegisterRequestDTO(
    string Name,
    string Surname,
    string Email,
    string Password,
    string ConfirmPassword,
    string Phone,
    Country CountryCitizenship
);
