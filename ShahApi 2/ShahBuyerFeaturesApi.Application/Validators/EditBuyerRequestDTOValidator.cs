using FluentValidation;
using ShahBuyerFeaturesApi.Core.DTOs.Request;

namespace ShahBuyerFeaturesApi.Infrastructure.Validators
{
    public class BuyerEditRequestValidator : AbstractValidator<EditBuyerRequestDTO>
    {
        public BuyerEditRequestValidator()
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
            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone number is required.")
                .MinimumLength(10).WithMessage("Phone must be at least 10 digits.")
                .MaximumLength(15).WithMessage("Phone must not exceed 15 digits.")
                .Matches("^\\d+$").WithMessage("Phone must contain only digits.");
            RuleFor(x => x.CountryCitizenshipId)
                .NotNull().WithMessage("Country citizenship is required.")
                .GreaterThan(0).WithMessage("Country citizenship must be a valid country code.");
        }
    }
}