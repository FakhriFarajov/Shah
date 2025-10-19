namespace ShahAuthApi.Core.DTOs.AdminDtos.Request;



public record AdminRegisterRequestDTO(
    string Name,
    string Surname,
    string Email,
    string Password,
    string ConfirmPassword,
    string Phone,
    int CountryCitizenshipId
);
