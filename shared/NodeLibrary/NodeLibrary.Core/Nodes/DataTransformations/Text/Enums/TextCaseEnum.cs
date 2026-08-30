namespace NodeLibrary.TextNodes.Enums;

public enum TextCaseEnum
{
    [Display(Name = "UPPERCASE", Description = "Convert text to all uppercase letters.")]
    Uppercase,

    [Display(Name = "lowercase", Description = "Convert text to all lowercase letters.")]
    Lowercase,

    [Display(Name = "Sentence case", Description = "Convert text to sentence case (capitalize the first letter).")]
    SentenceCase,

    [Display(Name = "Title Case", Description = "Convert text to title case (capitalize each word).")]
    TitleCase
}
