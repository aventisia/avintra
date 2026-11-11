namespace NodeLibrary.TextNodes.Enums;

public enum OutputTypeEnum
{
    [Display(Name = "Whole number", Description = "Whole numbers with no decimals, e.g. 123.")]
    Integer,

    [Display(Name = "Decimal number", Description = "Numbers with decimals for general use, e.g. 123.45 (accurate to about 15-17 significant digits).")]
    Double,

    [Display(Name = "Exact decimal number", Description = "Numbers with decimals kept exactly up to 28-29 significant digits, e.g. 19.99 for money.")]
    Decimal
}
