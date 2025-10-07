namespace ShahAdminAuthApi.Contracts.DTOs.Request;

public record ForgotPasswordRequestDTO
{
    public string Email { get; set; }
    public string NewPassword { get; set; }
    public string OldPassword { get; set; }
}
