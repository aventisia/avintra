namespace AspNetToolkit.Attributes;

public class RequiredGuidAttribute : ValidationAttribute
{
    // Store the original error message template.
    private readonly string _errorMessageTemplate;

    public RequiredGuidAttribute(string errorMessage = "The {0} is required and cannot be empty.")
    {
        _errorMessageTemplate = errorMessage;
    }

    protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
    {
        if (value is Guid guidValue && guidValue != Guid.Empty)
        {
            return ValidationResult.Success!;
        }
        else
        {
            // Use the property name in the error message.
            var errorMessage = FormatErrorMessage(validationContext.DisplayName);
            return new ValidationResult(errorMessage);
        }
    }

    public override string FormatErrorMessage(string name)
    {
        // Format the error message to include the property name.
        return string.Format(_errorMessageTemplate, name);
    }
}