using FluentValidation;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Application.Validators
{
    public class UpdateWarehouseRequestValidator : AbstractValidator<UpdateWarehouseRequestDTO>
    {
        public UpdateWarehouseRequestValidator()
        {
            RuleFor(x => x.Capacity)
                .Must(c => !c.HasValue || c.Value >= 0)
                .WithMessage("Capacity cannot be negative.");


            // Validate inline Address if provided
            When(x => x.Address != null, () =>
            {
                RuleFor(x => x.Address!.Street).NotEmpty().WithMessage("Street is required.");
                RuleFor(x => x.Address!.City).NotEmpty().WithMessage("City is required.");
                RuleFor(x => x.Address!.State).NotEmpty().WithMessage("State is required.");
                RuleFor(x => x.Address!.PostalCode).NotEmpty().WithMessage("PostalCode is required.");
                RuleFor(x => x.Address!.CountryId)
                    .GreaterThan(0).WithMessage("CountryId must be a valid id.")
                    .WithMessage("Country not found.");
            });
        }
    }
}
