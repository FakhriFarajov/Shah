using FluentValidation;
using ShahAdminAuthApi.Contracts.DTOs.Request;
using ShahAdminAuthApi.Core.Enums;

namespace ShahAdminAuthApi.Infrastructure.Validators
{
    public class AdminRegisterRequestDTOValidator : AbstractValidator<AdminRegisterRequestDTO>
    {
        public AdminRegisterRequestDTOValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .Matches("^[A-Za-z]+$").WithMessage("Name must contain only letters.");
            RuleFor(x => x.Surname)
                .NotEmpty().WithMessage("Surname is required.")
                .Matches("^[A-Za-z]+$").WithMessage("Surname must contain only letters.");
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.")
                .Matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
                .WithMessage("Email must be a valid email address.");
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
                .Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&_]+$")
                .WithMessage("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.Password).WithMessage("Passwords do not match.");
            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone is required.").Matches("^\\d+$").WithMessage("Phone must contain only digits.")
                .MaximumLength(15).WithMessage("Phone must be at most 15 digits.");
            RuleFor(x => x.CountryCitizenship)
                .IsInEnum().WithMessage("Invalid country citizenship.");
        }
    }
}