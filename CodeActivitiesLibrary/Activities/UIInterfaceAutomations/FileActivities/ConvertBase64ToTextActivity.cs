using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Text;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Convert Base64 to Text")]
    [Description("Converts a Base64-encoded string to plain text.")]
    public class ConvertBase64ToTextActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Base64 String")]
        [Description("The Base64-encoded string to convert.")]
        public InArgument<string> Base64String { get; set; }

        [DisplayName("Plain Text")]
        [Description("Returns the converted plain text.")]
        public OutArgument<string> PlainText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var base64 = Base64String.Get(context);
            var result = string.Empty;
            string status;

            try
            {
                // Clean up the Base64 string
                if (string.IsNullOrWhiteSpace(base64))
                    throw new ArgumentException("Base64 string cannot be null or empty.");

                base64 = base64.Replace(" ", "").Replace("\n", "").Replace("\r", "").Replace("\t", "");

                // Decode Base64
                var data = Convert.FromBase64String(base64);
                result = Encoding.UTF8.GetString(data);

                status = "Base64 string successfully converted to plain text.";
                PlainText.Set(context, result);
                StatusMessage.Set(context, status);
            }
            catch (FormatException fex)
            {
                status = $"Invalid Base64 format: {fex.Message}";
                PlainText.Set(context, null);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error converting Base64 to text: {ex.Message}";

                PlainText.Set(context, null);
                StatusMessage.Set(context, status);
            }
        }
    }
}