namespace ShahSellerAuthApi.Core.Models;

public class BlacklistedToken
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Token { get; set; } = null!;  // The JWT string
    public DateTime ExpiryTime { get; set; }    // Original expiry of the token
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}