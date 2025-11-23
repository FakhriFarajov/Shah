using FluentValidation;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahSellerFeaturesApi.Application.Validators
{
    public class SellerEditRequestValidator : AbstractValidator<EditSellerRequestDTO>
    {
        public SellerEditRequestValidator()
        {
            // Name and Surname: optional on edit, but if provided must be letters and reasonable length
            RuleFor(x => x.Name)
                .Cascade(CascadeMode.Stop)
                .MinimumLength(2).WithMessage("Name must be at least 2 characters.")
                .MaximumLength(50).WithMessage("Name must not exceed 50 characters.")
                .Matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+$").WithMessage("Name must contain only letters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Name));

            RuleFor(x => x.Surname)
                .Cascade(CascadeMode.Stop)
                .MinimumLength(2).WithMessage("Surname must be at least 2 characters.")
                .MaximumLength(50).WithMessage("Surname must not exceed 50 characters.")
                .Matches("^[A-Za-zÀ-ÖØ-öø-ÿ]+$").WithMessage("Surname must contain only letters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Surname));

            // Email: optional, if present must be valid
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format.")
                .MaximumLength(254).WithMessage("Email must not exceed 254 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Email));
            
            // Phone: optional, allow international numbers (digits and optional leading +)
            RuleFor(x => x.Phone)
                .Matches("^\\+?\\d{5,15}$").WithMessage("Phone must contain only digits and may start with +, length between 5 and 15.")
                .When(x => !string.IsNullOrWhiteSpace(x.Phone));

            // CountryCitizenshipId: optional on edit, but if provided must be > 0
            RuleFor(x => x.CountryCitizenshipId)
                .GreaterThan(0).WithMessage("Country citizenship must be a valid country code.")
                .When(x => x.CountryCitizenshipId.HasValue);

            // Store related fields
            RuleFor(x => x.StoreName)
                .MinimumLength(2).WithMessage("Store name must be at least 2 characters.")
                .MaximumLength(200).WithMessage("Store name must not exceed 200 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.StoreName));

            RuleFor(x => x.StoreDescription)
                .MaximumLength(1000).WithMessage("Store description must not exceed 1000 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.StoreDescription));

            RuleFor(x => x.StoreContactEmail)
                .EmailAddress().WithMessage("Invalid store contact email format.")
                .When(x => !string.IsNullOrWhiteSpace(x.StoreContactEmail));

            RuleFor(x => x.StoreContactPhone)
                .Matches("^\\+?\\d{7,15}$").WithMessage("Store contact phone must contain only digits and may start with +, length between 7 and 15.")
                .When(x => !string.IsNullOrWhiteSpace(x.StoreContactPhone));

            // Tax info
            RuleFor(x => x.TaxId)
                .GreaterThan(0).WithMessage("TaxId must be a valid tax id.")
                .When(x => x.TaxId.HasValue);

            RuleFor(x => x.TaxNumber)
                .Matches("^[A-Za-z0-9\\-\\/]+$").WithMessage("Tax number must contain only letters, digits, dash or slash.")
                .MinimumLength(3).WithMessage("Tax number must be at least 3 characters.")
                .MaximumLength(50).WithMessage("Tax number must not exceed 50 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.TaxNumber));

            // Address fields (optional)
            RuleFor(x => x.Street)
                .MaximumLength(200).WithMessage("Street must not exceed 200 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Street));

            RuleFor(x => x.City)
                .MaximumLength(100).WithMessage("City must not exceed 100 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.City));

            RuleFor(x => x.State)
                .MaximumLength(100).WithMessage("State must not exceed 100 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.State));

            RuleFor(x => x.PostalCode)
                .Matches("^[A-Za-z0-9\\- ]{2,20}$").WithMessage("Postal code must be 2-20 characters and contain only letters, digits, space or dash.")
                .When(x => !string.IsNullOrWhiteSpace(x.PostalCode));

            RuleFor(x => x.StoreCountryCodeId)
                .GreaterThan(0).WithMessage("Store country code must be a valid country code.")
                .When(x => x.StoreCountryCodeId.HasValue);
        }
    }
}