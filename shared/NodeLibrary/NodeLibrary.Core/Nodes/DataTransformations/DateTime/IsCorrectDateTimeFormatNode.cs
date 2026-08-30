using System.Globalization;

namespace NodeLibrary.DateTimeNodes;

[DisplayName("Validate DateTime Format"), Description("Checks if the input string matches the specified date and time format.")]
[NodeMetadata(icon: "/assets/DateTime.svg")]
public class IsCorrectDateTimeFormatNode : BaseNode
{
    [DisplayName("DateTime String"), Description("The date and time string to validate.")]
    public required InArgument<string> InputDateTime { get; set; }

    [DisplayName("Expected Format"), Description("The expected format pattern to validate against (e.g., yyyy-MM-dd HH:mm:ss).")]
    public required InArgument<string> DateTimeFormat { get; set; }

    [DisplayName("Is Format Valid"), Description("Returns true if the input matches the expected format; otherwise, false.")]
    public OutArgument<bool> IsValid { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var input = InputDateTime.Get(context);
            var format = DateTimeFormat.Get(context);

            if (string.IsNullOrWhiteSpace(input))
                throw new ArgumentException("InputDateTime cannot be null or empty.", nameof(InputDateTime));
            if (string.IsNullOrWhiteSpace(format))
                throw new ArgumentException("DateTimeFormat cannot be null or empty.", nameof(DateTimeFormat));

            input = input.Trim();

            bool isValid = DateTime.TryParseExact(
                input,
                new[] { format },
                DateTimeFormatInfo.InvariantInfo,
                DateTimeStyles.None,
                out _
            );

            IsValid.Set(context, isValid);
            status += $" Date/time format validation completed: {(isValid ? "valid" : "invalid")}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsValid.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error during format validation: {ex.Message}");
        }
    }
}
