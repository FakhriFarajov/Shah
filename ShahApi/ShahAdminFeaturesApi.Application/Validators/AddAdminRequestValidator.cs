using FluentValidation;
using Microsoft.EntityFrameworkCore;
using ShahAdminFeaturesApi.Core.DTOs.Request;
using ShahAdminFeaturesApi.Infrastructure.Contexts;

namespace ShahAdminFeaturesApi.Application.Validators
{
    public class AddAdminRequestValidator : AbstractValidator<AddAdminRequestDTO>
    {
        public AddAdminRequestValidator(ShahDbContext db)
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .Matches("^[A-Za-z]+$").WithMessage("Name must contain only letters.");

            RuleFor(x => x.Surname)
                .NotEmpty().WithMessage("Surname is required.")
                .Matches("^[A-Za-z]+$").WithMessage("Surname must contain only letters.");

            RuleFor(x => x.Email)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.")
                .Matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
                .WithMessage("Email must be a valid email address.")
                .WithMessage("Email is already in use.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone number is required.")
                .MinimumLength(5).WithMessage("Phone must be at least 5 digits.")
                .MaximumLength(15).WithMessage("Phone must not exceed 15 digits.")
                .Matches("^\\d+$").WithMessage("Phone must contain only digits.");

            RuleFor(x => x.CountryCitizenshipId)
                .NotNull().WithMessage("Country citizenship is required.")
                .GreaterThan(0).WithMessage("Country citizenship must be a valid country code.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
                .Matches("[!@#$%^&*(),.?\\\"{}|<>_+-=;:'`~\\[\\]\\/]").WithMessage("Password must contain at least one special character.");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Confirm password is required.")
                .Equal(x => x.Password).WithMessage("Passwords do not match.");
        }
    }
}
