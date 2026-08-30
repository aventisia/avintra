namespace NodeLibrary.XmlNodes.Enums;

public enum GetValueAsEnum
{
    [Display(Name = "Text Value", Description = "Returns the attribute value as plain text.")]
    TextValue,

    [Display(Name = "Numeric Value", Description = "Parses the attribute value into a numeric (double) format.")]
    NumericValue,

    [Display(Name = "Date Time Value", Description = "Parses the attribute value into a DateTime format.")]
    DateTimeValue,

    [Display(Name = "Boolean Value", Description = "Parses the attribute value into a Boolean (true/false) format.")]
    BooleanValue
}
