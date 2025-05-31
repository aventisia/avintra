using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Create Random Text")]
    [Description("Generates a text of specified length consisting of random characters.")]
    public class CreateRandomTextActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Minimum Length")]
        [Description("The minimum length of the random text to generate.")]
        public InArgument<int> MinimumLength { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Maximum Length")]
        [Description("The maximum length of the random text to generate.")]
        public InArgument<int> MaximumLength { get; set; }

        [Category("Input")]
        [DisplayName("Use Uppercase Letters")]
        [Description("If true, includes uppercase letters (A-Z) in the generated text.")]
        [DefaultValue(true)]
        public InArgument<bool> UseUppercaseLetters { get; set; } = new InArgument<bool>(true);

        [Category("Input")]
        [DisplayName("Use Lowercase Letters")]
        [Description("If true, includes lowercase letters (a-z) in the generated text.")]
        [DefaultValue(true)]
        public InArgument<bool> UseLowercaseLetters { get; set; } = new InArgument<bool>(true);

        [Category("Input")]
        [DisplayName("Use Digits")]
        [Description("If true, includes digits (0-9) in the generated text.")]
        [DefaultValue(true)]
        public InArgument<bool> UseDigits { get; set; } = new InArgument<bool>(true);

        [Category("Input")]
        [DisplayName("Use Symbols")]
        [Description("If true, includes symbols (!@#$%^&*()_+-=[]{}|;:,.<>? ) in the generated text.")]
        [DefaultValue(false)]
        public InArgument<bool> UseSymbols { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Random Text")]
        [Description("The generated random text.")]
        public OutArgument<string> RandomText { get; set; }

        [Category("Output")]
 
        public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
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
                var length =
                    random.Next(minLength, maxLength + 1); // Generate a random length within the specified range

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
                {
                    result[i] = allowedCharacters[random.Next(allowedCharacters.Length)];
                }

                RandomText.Set(context, new string(result));
            }
            catch (Exception ex)
            {
                status = $"Error generating random text: {ex.Message}";
                RandomText.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }
}