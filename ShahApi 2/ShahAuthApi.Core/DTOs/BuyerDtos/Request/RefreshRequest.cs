namespace ShahAuthApi.Core.DTOs.BuyerDtos.Request;

public class RefreshRequest
{
    public string RefreshToken { get; set; }
    public string OldAccessToken { get; set; } // optional, for blacklisting
}