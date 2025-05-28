using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Create Random Text"),
     Description("Generates a text of specified length consisting of random characters.")]
    public class CreateRandomTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Length"),
         Description("The length of the random text to generate.")]
        public InArgument<int> Length { get; set; }

        [Category("Output"), DisplayName("Result Text"), Description("The generated random text.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var length = Length.Get(context);

                if (length <= 0)
                    throw new ArgumentException("Length must be greater than zero.");

                const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                var random = new Random();
                var result = new char[length];

                for (var i = 0; i < length; i++)
                {
                    result[i] = chars[random.Next(chars.Length)];
                }

                ResultText.Set(context, new string(result));
                StatusMessage.Set(context, "Random text generated successfully.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
