using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities.Enums
{
    public enum TextCaseEnum
    {
        [Display(Name = "Uppercase", Description = "Converts text to all uppercase letters.")]
        Uppercase = 0,

        [Display(Name = "Lowercase", Description = "Converts text to all lowercase letters.")]
        Lowercase = 1,

        [Display(Name = "Title Case", Description = "Converts text to title case (first letter of each word capitalized).")]
        TitleCase = 2,

        [Display(Name = "Sentence Case", Description = "Converts text to sentence case (first letter capitalized, rest lowercase).")]
        SentenceCase = 3
    }
}