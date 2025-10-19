namespace ShahAuthApi.Core.DTOs.BuyerDtos.Request;

public record ForgotPasswordRequestDTO
{
    public string userId { get; set; }
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmNewPassword { get; set; }
    
}
