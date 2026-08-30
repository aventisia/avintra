namespace NodeLibrary.TextNodes.Enums;

public enum LengthTypeEnum
{
    [Display(Name = "Until End", Description = "Extracts until the end of the string.")]
    UntilEnd,

    [Display(Name = "Specific Length", Description = "Extracts a specific number of characters.")]
    SpecificLength
}
