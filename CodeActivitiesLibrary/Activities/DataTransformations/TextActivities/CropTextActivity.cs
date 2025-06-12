using System;
using System.Activities;
using System.ComponentModel;
using CodeActivitiesLibrary.DataTransformations.TextActivities.Enums;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Crop Text")]
    [Description("Extracts text before, after, or between specified flags.")]
    public class CropTextActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Original Text")]
        [Description("The full text value from which to extract a portion.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument]
        [DisplayName("Mode")]
        [Description("Specifies how to crop the text relative to the flag(s).")]
        [DefaultValue(CropModeEnum.BeforeFlag)]
        public InArgument<CropModeEnum> Mode { get; set; }

        [RequiredArgument]
        [DisplayName("Flag")]
        [Description("The flag used to locate the text to extract. Required in 'Before Flag' and 'After Flag' modes.")]
        public InArgument<string> Flag { get; set; }


        [DisplayName("Second Flag")]
        [Description("The second flag used in 'Between Flags' mode to mark the end of the extracted text.")]
        [RenderIfCondition(nameof(Mode), CropModeEnum.BetweenFlags)]
        public InArgument<string> SecondFlag { get; set; }


        [DisplayName("Ignore Case")]
        [Description("When true, ignores case when matching flags.")]
        [DefaultValue(true)]
        public InArgument<bool> IgnoreCase { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Cropped Text")]
        [Description("The extracted portion of the original text based on the specified mode.")]
        public OutArgument<string> CroppedText { get; set; }


        [DisplayName("Is Flag Found")]
        [Description("Indicates whether the specified flag(s) were found in the original text.")]
        public OutArgument<bool> IsFlagFound { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var originalText = OriginalText.Get(context);
                var mode = Mode.Get(context);
                var flag = Flag.Get(context);
                var secondFlag = SecondFlag.Get(context);
                var ignoreCase = IgnoreCase.Get(context);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("Original text cannot be empty.");

                switch (mode)
                {
                    case CropModeEnum.BeforeFlag:
                    case CropModeEnum.AfterFlag:
                    {
                        if (string.IsNullOrWhiteSpace(flag))
                            throw new ArgumentException($"Flag is required in '{mode}' mode.");
                        break;
                    }
                    case CropModeEnum.BetweenFlags when string.IsNullOrWhiteSpace(flag):
                        throw new ArgumentException("First flag is required in 'Between Flags' mode.");
                    case CropModeEnum.BetweenFlags when string.IsNullOrWhiteSpace(secondFlag):
                        throw new ArgumentException("Second flag is required in 'Between Flags' mode.");
                    default:
                        throw new ArgumentOutOfRangeException();
                }

                string result = null;
                var flagFound = false;

                switch (mode)
                {
                    case CropModeEnum.BeforeFlag:
                        result = GetTextBeforeFlag(originalText, flag, ignoreCase, out flagFound);
                        break;

                    case CropModeEnum.AfterFlag:
                        result = GetTextAfterFlag(originalText, flag, ignoreCase, out flagFound);
                        break;

                    case CropModeEnum.BetweenFlags:
                        result = GetTextBetweenFlags(originalText, flag, secondFlag, ignoreCase, out flagFound);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(mode), mode, null);
                }

                CroppedText.Set(context, result);
                IsFlagFound.Set(context, flagFound);
            }
            catch (Exception ex)
            {
                status = $"Error cropping text: {ex.Message}";
                CroppedText.Set(context, null);
                IsFlagFound.Set(context, false);
            }

            StatusMessage.Set(context, status);
        }

        private static string GetTextBeforeFlag(string text, string flag, bool ignoreCase, out bool flagFound)
        {
            var index = ignoreCase
                ? text.IndexOf(flag, StringComparison.OrdinalIgnoreCase)
                : text.IndexOf(flag, StringComparison.Ordinal);

            flagFound = index != -1;

            return index == -1 ? null : text.Substring(0, index);
        }

        private static string GetTextAfterFlag(string text, string flag, bool ignoreCase, out bool flagFound)
        {
            var index = ignoreCase
                ? text.IndexOf(flag, StringComparison.OrdinalIgnoreCase)
                : text.IndexOf(flag, StringComparison.Ordinal);

            flagFound = index != -1;

            return index == -1 ? null : text.Substring(index + flag.Length);
        }

        private static string GetTextBetweenFlags(string text, string flag1, string flag2, bool ignoreCase,
            out bool flagFound)
        {
            var startIndex = ignoreCase
                ? text.IndexOf(flag1, StringComparison.OrdinalIgnoreCase)
                : text.IndexOf(flag1, StringComparison.Ordinal);

            if (startIndex == -1)
            {
                flagFound = false;
                return null;
            }

            var endIndex = ignoreCase
                ? text.IndexOf(flag2, startIndex + flag1.Length, StringComparison.OrdinalIgnoreCase)
                : text.IndexOf(flag2, startIndex + flag1.Length, StringComparison.Ordinal);

            flagFound = endIndex != -1;

            return !flagFound
                ? null
                : text.Substring(startIndex + flag1.Length, endIndex - (startIndex + flag1.Length));
        }
    }
}