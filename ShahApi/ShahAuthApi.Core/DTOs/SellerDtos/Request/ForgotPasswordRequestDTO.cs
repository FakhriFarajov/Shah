namespace ShahAuthApi.Core.DTOs.SellerDtos.Request;

public record ChangePassword
{
    public string userId { get; set; }
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmNewPassword { get; set; }
}
