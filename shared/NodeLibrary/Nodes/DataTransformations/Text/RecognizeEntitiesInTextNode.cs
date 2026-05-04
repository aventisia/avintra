using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Recognize Entities in Text"), Description("Identifies specific entities in text, such as dates, numbers, emails, URLs, etc., across multiple languages.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class RecognizeEntitiesInTextNode : BaseNode
{
    [DisplayName("Text To Analyze"), Description("The text from which entities will be recognized.")]
    public required InArgument<string> TextToAnalyze { get; set; }

    [DisplayName("Entity Type"), Description("Specifies the type of entities to recognize (e.g., Date, Number, Email).")]
    public required InArgument<EntityTypeEnum> EntityType { get; set; }

    [DisplayName("Language"), Description("The language of the text. Optional, but can improve recognition accuracy.")]
    public InArgument<LanguageEnum> Language { get; set; }

    [DisplayName("Recognized Entities"), Description("Returns the list of recognized entities based on the specified entity type.")]
    public OutArgument<IEnumerable<string>> RecognizedEntities { get; set; } = new OutArgument<IEnumerable<string>>();

    protected override void Execute(INodeContext context)
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
                case EntityTypeEnum.IPAddress:
                    recognizedEntities.AddRange(ExtractIPEntities(textToAnalyze));
                    break;
                case EntityTypeEnum.Hashtag:
                    recognizedEntities.AddRange(ExtractHashtagEntities(textToAnalyze));
                    break;
                case EntityTypeEnum.URL:
                    recognizedEntities.AddRange(ExtractURLEntities(textToAnalyze));
                    break;
                case EntityTypeEnum.GUID:
                    recognizedEntities.AddRange(ExtractGUIDEntities(textToAnalyze));
                    break;
                case EntityTypeEnum.QuotedText:
                    recognizedEntities.AddRange(ExtractQuotedTextEntities(textToAnalyze));
                    break;
                case EntityTypeEnum.Mention:
                    recognizedEntities.AddRange(ExtractMentionEntities(textToAnalyze));
                    break;
                default:
                    throw new ArgumentException("Unsupported entity type.");
            }

            RecognizedEntities.Set(context, recognizedEntities);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Recognizing entities successfully");
        }
        catch (Exception ex)
        {
            RecognizedEntities.Set(context, []);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error recognizing entities: {ex.Message}");
        }
    }

    private static IEnumerable<string> ExtractDateTimeEntities(string text)
    {
        var dateTimePatterns = new[]
        {
            @"\b\d{4}-\d{2}-\d{2}\b",
            @"\b\d{1,2}/\d{1,2}/\d{4}\b",
            @"\b\d{1,2}-\d{1,2}-\d{4}\b",
            @"\b\d{1,2} \w+ \d{4}\b"
        };
        var matches = new List<string>();
        foreach (var pattern in dateTimePatterns)
            matches.AddRange(Regex.Matches(text, pattern).Cast<Match>().Select(m => m.Value));
        return matches;
    }

    private static IEnumerable<string> ExtractDimensionEntities(string text)
    {
        return Regex.Matches(text, @"\d+\s*(cm|mm|m|km|in|ft|yd|mi)\b")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractTemperatureEntities(string text)
    {
        return Regex.Matches(text, @"\d+\s*°[CF]\b")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractCurrencyEntities(string text)
    {
        return Regex.Matches(text, @"[$€£¥₹]\d+(?:,\d{3})*(?:\.\d{2})?")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractNumberRangeEntities(string text)
    {
        return Regex.Matches(text, @"\d+\s*-\s*\d+")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractNumberEntities(string text)
    {
        return Regex.Matches(text, @"\b\d+(?:\.\d+)?\b")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractOrdinalEntities(string text)
    {
        return Regex.Matches(text, @"\b\d+(?:st|nd|rd|th)\b")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractPercentageEntities(string text)
    {
        return Regex.Matches(text, @"\d+(?:\.\d+)?%")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractPhoneNumberEntities(string text)
    {
        return Regex.Matches(text, @"(?:\+?1\s?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractEmailEntities(string text)
    {
        return Regex.Matches(text, @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
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
        return Regex.Matches(text, @"@\w+")
            .Cast<Match>()
            .Select(m => m.Value);
    }

    private static IEnumerable<string> ExtractURLEntities(string text)
    {
        return Regex.Matches(text, @"https?://[^\s]+")
            .Cast<Match>()
            .Select(m => m.Value.TrimEnd('.', ',', ';', ')', '(', '"'));
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
        var guidPattern = @"\{?[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}\}?";
        return Regex.Matches(text, guidPattern)
            .Cast<Match>()
            .Select(m => m.Value);
    }
}

public enum LanguageEnum
{
    [Display(Name = "English", Description = "English language.")]
    English,

    [Display(Name = "Chinese (Simplified)", Description = "Simplified Chinese language.")]
    ChineseSimplified,

    [Display(Name = "Spanish", Description = "Spanish language (Generic).")]
    Spanish,

    [Display(Name = "Spanish (Mexico)", Description = "Spanish language as spoken in Mexico.")]
    SpanishMexico,

    [Display(Name = "Portuguese", Description = "Portuguese language (Generic).")]
    Portuguese,

    [Display(Name = "French", Description = "French language.")]
    French,

    [Display(Name = "German", Description = "German language.")]
    German,

    [Display(Name = "Italian", Description = "Italian language.")]
    Italian,

    [Display(Name = "Japanese", Description = "Japanese language.")]
    Japanese,

    [Display(Name = "Dutch", Description = "Dutch language.")]
    Dutch,

    [Display(Name = "Korean", Description = "Korean language.")]
    Korean,

    [Display(Name = "Swedish", Description = "Swedish language.")]
    Swedish,

    [Display(Name = "Turkish", Description = "Turkish language.")]
    Turkish,

    [Display(Name = "Hindi", Description = "Hindi language.")]
    Hindi
}
