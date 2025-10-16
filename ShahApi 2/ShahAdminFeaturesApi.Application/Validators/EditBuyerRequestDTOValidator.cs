namespace ShahAdminFeaturesApi.Application.Validators
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
                .MinimumLength(5).WithMessage("Password must be at least 6 characters long.")
                .MaximumLength(15).WithMessage("Password must not exceed 15 characters.")
                .Matches("^\\d+$").WithMessage("Phone must contain only digits.");
            RuleFor(x => x.CountryCitizenship)
                .IsInEnum().WithMessage("Invalid country citizenship.");
        }
    }
}