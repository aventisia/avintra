namespace NodeLibrary.TextNodes;

[DisplayName("Create Random Text"), Description("Generates a text of specified length consisting of random characters.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class CreateRandomTextNode : BaseNode
{
    [DisplayName("Minimum Length"), Description("The minimum length of the random text to generate.")]
    public required InArgument<int> MinimumLength { get; set; }

    [DisplayName("Maximum Length"), Description("The maximum length of the random text to generate.")]
    public required InArgument<int> MaximumLength { get; set; }

    [DisplayName("Use Uppercase Letters"), Description("If true, includes uppercase letters (A-Z) in the generated text.")]
    public InArgument<bool> UseUppercaseLetters { get; set; } = new InArgument<bool>(true);

    [DisplayName("Use Lowercase Letters"), Description("If true, includes lowercase letters (a-z) in the generated text.")]
    public InArgument<bool> UseLowercaseLetters { get; set; } = new InArgument<bool>(true);

    [DisplayName("Use Digits"), Description("If true, includes digits (0-9) in the generated text.")]
    public InArgument<bool> UseDigits { get; set; } = new InArgument<bool>(true);

    [DisplayName("Use Symbols"), Description("If true, includes symbols (!@#$%^&*()_+-=[]{}|;:,.<>? ) in the generated text.")]
    public InArgument<bool> UseSymbols { get; set; } = new InArgument<bool>(false);

    [DisplayName("Random Text"), Description("The generated random text.")]
    public OutArgument<string> RandomText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var minLength = MinimumLength.Get(context);
            var maxLength = MaximumLength.Get(context);
            var useUppercase = UseUppercaseLetters.Get(context);
            var useLowercase = UseLowercaseLetters.Get(context);
            var useDigits = UseDigits.Get(context);
            var useSymbols = UseSymbols.Get(context);

            if (minLength <= 0 || maxLength < minLength)
                throw new ArgumentException(
                    "Minimum length must be greater than zero, and Maximum length must be at least as large as Minimum length.");

            var random = new Random();
            var length = random.Next(minLength, maxLength + 1);

            var allowedCharacters = "";

            if (useUppercase)
                allowedCharacters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            if (useLowercase)
                allowedCharacters += "abcdefghijklmnopqrstuvwxyz";
            if (useDigits)
                allowedCharacters += "0123456789";
            if (useSymbols)
                allowedCharacters += "!@#$%^&*()_+-=[]{}|;:,.<>?";

            if (string.IsNullOrEmpty(allowedCharacters))
                throw new ArgumentException("At least one character type must be selected.");

            var result = new char[length];

            for (var i = 0; i < length; i++)
                result[i] = allowedCharacters[random.Next(allowedCharacters.Length)];

            RandomText.Set(context, new string(result));
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Random text generated successfully.");
        }
        catch (Exception ex)
        {
            RandomText.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error generating random text: {ex.Message}");
        }
    }
}
