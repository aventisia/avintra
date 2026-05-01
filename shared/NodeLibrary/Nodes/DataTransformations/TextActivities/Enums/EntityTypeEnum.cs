using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.TextActivities.Enums;

public enum EntityTypeEnum
{
    [Display(Name = "Date Time", Description = "Recognizes date and time values.")]
    DateTime,

    [Display(Name = "Dimension", Description = "Recognizes dimensions like '10 cm', '5 inches'.")]
    Dimension,

    [Display(Name = "Temperature", Description = "Recognizes temperature values like '25°C', '77°F'.")]
    Temperature,

    [Display(Name = "Currency", Description = "Recognizes currency amounts like '$100', '€500'.")]
    Currency,

    [Display(Name = "Number Range", Description = "Recognizes number ranges like '1-10', '20-30'.")]
    NumberRange,

    [Display(Name = "Number", Description = "Recognizes numeric values.")]
    Number,

    [Display(Name = "Ordinal", Description = "Recognizes ordinal numbers like '1st', '2nd'.")]
    Ordinal,

    [Display(Name = "Percentage", Description = "Recognizes percentage values like '50%', '75%'.")]
    Percentage,

    [Display(Name = "Phone Number", Description = "Recognizes phone numbers like '+1 (123) 456-7890'.")]
    PhoneNumber,

    [Display(Name = "Email", Description = "Recognizes email addresses.")]
    Email,

    [Display(Name = "IP Address", Description = "Recognizes IP addresses.")]
    IPAddress,

    [Display(Name = "Mention", Description = "Recognizes mentions like '@username'.")]
    Mention,

    [Display(Name = "URL", Description = "Recognizes web URLs.")]
    URL,

    [Display(Name = "Hashtag", Description = "Recognizes hashtags.")]
    Hashtag,

    [Display(Name = "Quoted Text", Description = "Recognizes text enclosed in quotes.")]
    QuotedText,

    [Display(Name = "GUID", Description = "Recognizes globally unique identifiers (GUIDs).")]
    GUID
}
