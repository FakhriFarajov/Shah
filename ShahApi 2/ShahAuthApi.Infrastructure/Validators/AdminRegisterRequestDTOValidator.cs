using FluentValidation;
using ShahAuthApi.Core.DTOs.AdminDtos.Request;
using ShahAuthApi.Core.DTOs.SellerDtos.Request;

namespace ShahAuthApi.Infrastructure.Validators;

public class AdminRegisterRequestDTOValidator : AbstractValidator<AdminRegisterRequestDTO>
{
    public AdminRegisterRequestDTOValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
        RuleFor(x => x.Surname).NotEmpty().WithMessage("Surname is required.");
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.");
        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .Matches(@"^[0-9]+$").WithMessage("Phone must contain only numbers, e.g., 123456789")
            .MinimumLength(5).WithMessage("Phone must be at least 5 digits.")
            .MaximumLength(15).WithMessage("Phone must be at most 15 digits.");
        RuleFor(x => x.CountryCitizenshipId).NotEmpty().WithMessage("CountryCitizenship must be a valid country.");
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
            .Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&_]+$").WithMessage("Password must contain at least one uppercase letter, one lowercase letter, and one digit.");
        RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}
