namespace NodeLibrary.TextNodes.Enums;

public enum DelimiterTypeEnum
{
    [Display(Name = "Standard", Description = "Uses predefined delimiters like Tab or New Line.")]
    Standard,

    [Display(Name = "Number of Characters", Description = "Splits text into fixed-width chunks.")]
    NumberOfCharacters,

    [Display(Name = "Custom", Description = "Allows custom delimiters with optional regex support.")]
    Custom
}
