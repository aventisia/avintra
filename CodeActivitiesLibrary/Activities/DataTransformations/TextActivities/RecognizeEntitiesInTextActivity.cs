using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Recognize Entities in Text")]
    [Description(
        "Identifies specific entities in text, such as dates, numbers, emails, URLs, etc., across multiple languages.")]
    public class RecognizeEntitiesInTextActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Text To Analyze")]
        [Description("The text from which entities will be recognized.")]
        public InArgument<string> TextToAnalyze { get; set; }

        [RequiredArgument]
        [DisplayName("Entity Type")]
        [Description("Specifies the type of entities to recognize (e.g., Date, Number, Email).")]
        public InArgument<EntityTypeEnum> EntityType { get; set; }


        [DisplayName("Language")]
        [Description("The language of the text. Optional, but can improve recognition accuracy.")]
        public InArgument<string> Language { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Recognized Entities")]
        [Description("Returns the list of recognized entities based on the specified entity type.")]
        public OutArgument<IEnumerable<string>> RecognizedEntities { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var textToAnalyze = TextToAnalyze.Get(context);
                var entityType = EntityType.Get(context);
                var language = Language.Get(context);

                if (string.IsNullOrWhiteSpace(textToAnalyze))
                    throw new ArgumentException("TextToAnalyze cannot be empty.");

                var recognizedEntities = new List<string>();

                switch (entityType)
                {
                    case EntityTypeEnum.DateTime:
                        recognizedEntities.AddRange(ExtractDateTimeEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Dimension:
                        recognizedEntities.AddRange(ExtractDimensionEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Temperature:
                        recognizedEntities.AddRange(ExtractTemperatureEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Currency:
                        recognizedEntities.AddRange(ExtractCurrencyEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.NumberRange:
                        recognizedEntities.AddRange(ExtractNumberRangeEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Number:
                        recognizedEntities.AddRange(ExtractNumberEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Ordinal:
                        recognizedEntities.AddRange(ExtractOrdinalEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Percentage:
                        recognizedEntities.AddRange(ExtractPercentageEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.PhoneNumber:
                        recognizedEntities.AddRange(ExtractPhoneNumberEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Email:
                        recognizedEntities.AddRange(ExtractEmailEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.URL:
                        recognizedEntities.AddRange(ExtractURLEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.IPAddress:
                        recognizedEntities.AddRange(ExtractIPEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Hashtag:
                        recognizedEntities.AddRange(ExtractHashtagEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.QuotedText:
                        recognizedEntities.AddRange(ExtractQuotedTextEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.Mention:
                        recognizedEntities.AddRange(ExtractMentionEntities(textToAnalyze));
                        break;

                    case EntityTypeEnum.GUID:
                        recognizedEntities.AddRange(ExtractGUIDEntities(textToAnalyze));
                        break;

                    default:
                        throw new ArgumentException("Unsupported entity type.");
                }

                RecognizedEntities.Set(context, recognizedEntities);
            }
            catch (Exception ex)
            {
                status = $"Error recognizing entities: {ex.Message}";
                RecognizedEntities.Set(context, Array.Empty<string>());
            }

            StatusMessage.Set(context, status);
        }

        private static IEnumerable<string> ExtractDateTimeEntities(string text)
        {
            // Regex patterns for various date formats
            var dateTimePatterns = new[]
            {
                @"\b\d{4}-\d{2}-\d{2}\b", // YYYY-MM-DD
                @"\b\d{1,2}/\d{1,2}/\d{4}\b", // MM/DD/YYYY
                @"\b\d{1,2}-\d{1,2}-\d{4}\b", // DD-MM-YYYY
                @"\b\d{1,2} \w+ \d{4}\b" // 12 January 2023
            };

            var matches = new List<string>();
            foreach (var pattern in dateTimePatterns)
            {
                matches.AddRange(Regex.Matches(text, pattern).Cast<Match>().Select(m => m.Value));
            }

            return matches;
        }

        private static IEnumerable<string> ExtractDimensionEntities(string text)
        {
            // Example: 10 cm, 5 inches, 2 meters
            return Regex.Matches(text, @"\b\d+\s*(cm|inches|meters?)\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractTemperatureEntities(string text)
        {
            // Example: 25°C, 77°F
            return Regex.Matches(text, @"\b\d+(\.\d+)?°[CF]\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractCurrencyEntities(string text)
        {
            // Example: $100, €500, £200
            return Regex.Matches(text, @"[\$€£¥]?\d+(\.\d+)?")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractNumberRangeEntities(string text)
        {
            // Example: 1-10, 20-30
            return Regex.Matches(text, @"\b\d+-\d+\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractNumberEntities(string text)
        {
            return Regex.Matches(text, @"\b\d+\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractOrdinalEntities(string text)
        {
            // Example: 1st, 2nd, 3rd, 4th
            return Regex.Matches(text, @"\b\d+(st|nd|rd|th)\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractPercentageEntities(string text)
        {
            // Example: 50%, 75%
            return Regex.Matches(text, @"\b\d+(\.\d+)?%\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractPhoneNumberEntities(string text)
        {
            // Example: +1 (123) 456-7890, 01234567890
            return Regex.Matches(text, @"\+?\d[\d\- ()]+")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractEmailEntities(string text)
        {
            return Regex.Matches(text, @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractIPEntities(string text)
        {
            return Regex.Matches(text, @"\b(?:\d{1,3}\.){3}\d{1,3}\b")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractMentionEntities(string text)
        {
            // Example: @username
            return Regex.Matches(text, @"@\w+")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractURLEntities(string text)
        {
            return Regex.Matches(text, @"https?://[^\s]+")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractHashtagEntities(string text)
        {
            return Regex.Matches(text, @"#\w+")
                .Cast<Match>()
                .Select(m => m.Value);
        }

        private static IEnumerable<string> ExtractQuotedTextEntities(string text)
        {
            return Regex.Matches(text, "\"([^\"]*)\"|'([^']*)'")
                .Cast<Match>()
                .Select(m => m.Groups[1].Value ?? m.Groups[2].Value);
        }

        private static IEnumerable<string> ExtractGUIDEntities(string text)
        {
            // Regex pattern for matching GUIDs
            var guidPattern = @"\{?[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}\}?";

            return Regex.Matches(text, guidPattern)
                .Cast<Match>()
                .Select(m => m.Value);
        }
    }
}