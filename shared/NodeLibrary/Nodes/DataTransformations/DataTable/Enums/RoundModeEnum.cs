namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Determines how numeric column values are rounded.
/// </summary>
public enum RoundModeEnum
{
    [Display(Name = "Integer", Description = "Rounds the value to the nearest whole number.")]
    Integer = 0,

    [Display(Name = "Decimal Places", Description = "Rounds the value to a fixed number of decimal places.")]
    DecimalPlaces = 1,

    [Display(Name = "Significant Digits", Description = "Rounds the value to a fixed number of significant digits.")]
    SignificantDigits = 2
}
