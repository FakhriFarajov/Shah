using FluentValidation;
using ShahSellerFeaturesApi.Core.DTOs.Request;

namespace ShahSellerFeaturesApi.Application.Validators;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequestDTO>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty();
        RuleFor(x => x.StoreInfoId)
            .NotEmpty();
        RuleFor(x => x.Variants)
            .NotNull()
            .Must(v => v.Count > 0).WithMessage("At least one variant is required");

        RuleForEach(x => x.Variants).SetValidator(new CreateProductVariantValidator());
    }
}

public class CreateProductVariantValidator : AbstractValidator<CreateProductVariantDTO>
{
    public CreateProductVariantValidator()
    {
        RuleFor(v => v.Title)
            .NotEmpty()
            .MaximumLength(255);
        RuleFor(v => v.Description)
            .NotEmpty()
            .MaximumLength(4000);
        RuleFor(v => v.WeightInGrams)
            .GreaterThanOrEqualTo(0);
        RuleFor(v => v.Stock)
            .GreaterThanOrEqualTo(0);
        RuleFor(v => v.Price)
            .GreaterThanOrEqualTo(0);

        RuleForEach(v => v.Images).SetValidator(new CreateProductImageValidator());
        RuleFor(v => v.Images)
            .Must(images => images == null || images.Count <= 1 || images.Count(i => i.IsMain) <= 1)
            .WithMessage("Only one image can be marked as main per variant.");
    }
}

public class CreateProductImageValidator : AbstractValidator<CreateProductImageDTO>
{
    public CreateProductImageValidator()
    {
        RuleFor(i => i.ImageUrl)
            .NotEmpty()
            .MaximumLength(2048);
        // IsMain is boolean; no extra rule needed
    }
}
