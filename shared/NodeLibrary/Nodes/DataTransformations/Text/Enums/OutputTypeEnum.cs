namespace NodeLibrary.TextNodes.Enums;

public enum OutputTypeEnum
{
    [Display(Name = "Integer", Description = "Converts the text to an integer value.")]
    Integer,

    [Display(Name = "Double", Description = "Converts the text to a double-precision floating-point value.")]
    Double,

    [Display(Name = "Decimal", Description = "Converts the text to a decimal value.")]
    Decimal
}
