using FluentValidation;
using ShahAuthApi.Core.DTOs.SellerDtos.Request;

namespace ShahAuthApi.Infrastructure.Validators;

public class SellerRegisterRequestDTOValidator : AbstractValidator<SellerRegisterRequestDTO>
{
    public SellerRegisterRequestDTOValidator()
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
        RuleFor(x => x.Passport)
            .NotEmpty().WithMessage("Passport is required.")
            .Matches(@"^[A-Za-z0-9]{5,15}$").WithMessage("Passport must be alphanumeric and 5-15 characters.");
        RuleFor(x => x.CountryCitizenshipId).NotEmpty().WithMessage("CountryCitizenship must be a valid country.");
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
            .Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&_]+$").WithMessage("Password must contain at least one uppercase letter, one lowercase letter, and one digit.");
        RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("Passwords do not match.");
        RuleFor(x => x.StoreName).NotEmpty().WithMessage("Store name is required.");
        RuleFor(x => x.StoreDescription).NotEmpty().WithMessage("Store description is required.");
        RuleFor(x => x.StoreContactEmail)
            .NotEmpty().WithMessage("Store email is required.")
            .EmailAddress().WithMessage("Store email must be a valid email address.");
        RuleFor(x => x.StoreContactPhone)
            .NotEmpty().WithMessage("Store phone is required.")
            .Matches(@"^[0-9]+$").WithMessage("Store phone must contain only numbers, e.g., 123123123123")
            .MinimumLength(5).WithMessage("Store phone must be at least 5 digits.")
            .MaximumLength(15).WithMessage("Store phone must be at most 15 digits.");
        RuleFor(x => x.TaxId).NotEmpty().WithMessage("TaxIdType must be valid.");
        RuleFor(x => x.TaxNumber)
            .NotEmpty().WithMessage("Tax ID is required.")
            .Matches(@"^[A-Za-z0-9\-]{5,20}$").WithMessage("Tax ID must be alphanumeric, may include dashes, and 5-20 characters.");
        RuleFor(x => x.Street).NotEmpty().WithMessage("Street is required.");
        RuleFor(x => x.City).NotEmpty().WithMessage("City is required.");
        RuleFor(x => x.State).NotEmpty().WithMessage("State is required.");
        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required.")
            .Matches(@"^[A-Za-z0-9]{4,11}$").WithMessage("Postal code must be 4-11 alphanumeric characters.");
        RuleFor(x => x.StoreCountryCodeId).NotEmpty().WithMessage("StoreCountryCode must be a valid country.");
    }
}
