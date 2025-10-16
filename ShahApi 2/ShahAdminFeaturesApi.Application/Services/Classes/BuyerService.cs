using ShahAdminFeaturesApi.Application.Services.Interfaces;

namespace ShahAdminFeaturesApi.Application.Services.Classes;

public class BuyerService : IBuyerService
{
    private readonly ShahDbContext _context;
    private readonly IMapper _mapper;

    public BuyerService(ShahDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<string> GetIdByEmailAsync(string email)
    {
        var res =  await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (res == null)
        {
            throw new Exception("Buyer not found");
        }
        return res.Id;
    }
    
    public async Task<TypedResult<BuyerProfileResponseDTO>> GetBuyerByIdAsync(string buyerId)
    {
        var profile = await _context.BuyerProfiles
            .Include(bp => bp.User)
            .FirstOrDefaultAsync(bp => bp.Id == buyerId);
        
        if (profile == null)
            return TypedResult<BuyerProfileResponseDTO>.Error("BuyerProfile not found", 404);
        var dto = new BuyerProfileResponseDTO
        {
            Id = profile.Id,
            ImageProfile = profile.ImageProfile,
            AddressId = profile.AddressId,
            UserId = profile.UserId,
            Email = profile.User?.Email,
            Name = profile.User?.Name,
            Surname = profile.User?.Surname,
            Phone = profile.User?.Phone,
            CountryCitizenship = profile.User?.CountryCitizenship,
            createdAt = profile.User.CreatedAt,
        };
        return TypedResult<BuyerProfileResponseDTO>.Success(dto, "Buyer retrieved successfully");
    }

    public async Task<Result> EditBuyerAsync(string buyerId, EditBuyerRequestDTO dto)
    {
        var user = await _context.Users.Include(u => u.BuyerProfile).FirstOrDefaultAsync(u => u.BuyerProfileId == buyerId);
        if (user == null || user.BuyerProfile == null)
            return Result.Error("BuyerProfile not found", 404);

        // Update User fields
        if (!string.IsNullOrWhiteSpace(dto.Name)) user.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Surname)) user.Surname = dto.Surname;
        if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrWhiteSpace(dto.Phone)) user.Phone = dto.Phone;

        // Update BuyerProfile fields
        if (!string.IsNullOrWhiteSpace(dto.ImageProfile)) user.BuyerProfile.ImageProfile = dto.ImageProfile;
        if (dto.CountryCitizenship.HasValue) user.CountryCitizenship = dto.CountryCitizenship.Value;

        await _context.SaveChangesAsync();
        return Result.Success("Buyer edited successfully");
    }
}