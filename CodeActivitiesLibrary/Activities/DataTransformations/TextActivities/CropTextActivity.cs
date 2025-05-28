using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Crop Text"),
     Description("Retrieves a text value that occurs before, after, or between specified text flags in a given text.")]
    public class CropTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Original Text"), Description("The original text to crop.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Crop Mode"),
         Description("The cropping mode: Before, After, Between.")]
        public InArgument<CropModeEnum> CropMode { get; set; }

        [Category("Input"), DisplayName("Start Flag"),
         Description("The start flag for cropping (used in 'Between' mode).")]
        public InArgument<string> StartFlag { get; set; }

        [Category("Input"), DisplayName("End Flag"), Description("The end flag for cropping (used in 'Between' mode).")]
        public InArgument<string> EndFlag { get; set; }

        [Category("Output"), DisplayName("Result Text"), Description("The cropped text result.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var originalText = OriginalText.Get(context);
                var cropMode = CropMode.Get(context);
                var startFlag = StartFlag.Get(context);
                var endFlag = EndFlag.Get(context);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("OriginalText cannot be empty.");

                var result = string.Empty;

                switch (cropMode)
                {
                    case CropModeEnum.Before:
                        result = originalText.Split(new[] { startFlag }, StringSplitOptions.None)[0];
                        break;
                    case CropModeEnum.After:
                        result = originalText.Split(new[] { endFlag }, StringSplitOptions.None)[1];
                        break;
                    case CropModeEnum.Between:
                        result = originalText.Split(new[] { startFlag, endFlag }, StringSplitOptions.None)[1];
                        break;
                    default:
                        throw new ArgumentException("Invalid CropMode.");
                }

                ResultText.Set(context, result);
                StatusMessage.Set(context, "Text cropped successfully.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }

    public enum CropModeEnum
    {
        Before = 0,
        After = 1,
        Between = 2
    }
}
