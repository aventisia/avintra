using CodeActivitiesLibrary.DataTransformations.TextActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Change Text Case")]
    [Description("Converts the input text to the specified case format.")]
    [ActivityMetaData(nodeImg: "/assets/Text.svg")]
    public class ChangeTextCaseActivity : BaseCodeActivity
    {
        #region Inputs

        [DisplayName("Text to Convert")]
        [Description("The text to convert.")]
        public InArgument<string> TextToConvert { get; set; }


        [DisplayName("Convert To")]
        [Description("Specify the target case style: Upper, Lower, Title, or Sentence.")]
        public InArgument<TextCaseEnum> ConvertTo { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Result")]
        [Description("The converted text based on selected case style.")]
        public OutArgument<string> Result { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            string result = null;
            
            try
            {
                var input = TextToConvert.Get(context);
                var convertTo = ConvertTo.Get(context);

                switch (convertTo)
                {
                    case TextCaseEnum.Uppercase:
                        result = input != null ? input.ToUpper() : null;
                        break;
                    case TextCaseEnum.Lowercase:
                        result = input != null ? input.ToLower() : null;
                        break;
                    case TextCaseEnum.TitleCase:
                        result = ToTitleCase(input);
                        break;
                    case TextCaseEnum.SentenceCase:
                        result = ToSentenceCase(input);
                        break;
                    default:
                        result = input;
                        break;
                }

                Result.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text converted successfully.");
            }
            catch (Exception ex)
            {
                Result.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error converting text: {ex.Message}");
            }
        }


        private static string ToTitleCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(input.ToLower());
        }

        private static string ToSentenceCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return char.ToUpper(input[0]) + input.Substring(1).ToLower();
        }
    }
}