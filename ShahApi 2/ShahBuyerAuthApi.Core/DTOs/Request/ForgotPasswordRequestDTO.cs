namespace ShahBuyerAuthApi.Contracts.DTOs.Request;

public record ForgotPasswordRequestDTO
{
    public string userId { get; set; }
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
    
}
