using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Text;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Convert Base64 to Text"), Description("Converts a Base64-encoded string to plain text.")]
    public class ConvertBase64ToTextActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Base64-encoded string to convert.")]
        public InArgument<string> Base64String { get; set; }

        [Category("Output"), Description("Returns the converted plain text.")]
        public OutArgument<string> PlainText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var base64 = Base64String.Get(context);
            var plain = "";
            var status = "";

            try
            {
                plain = Encoding.UTF8.GetString(Convert.FromBase64String(base64));
                status = "Base64 string converted to plain text successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error converting Base64 to text: {ex.Message}";
            }

            PlainText.Set(context, plain);
            StatusMessage.Set(context, status);
        }
    }
}