namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Target data types supported when converting the data type of a column.
/// </summary>
public enum DataTypeConversionEnum
{
    [Display(Name = "String", Description = "Converts the column to a string (System.String).")]
    String = 0,

    [Display(Name = "Integer (Int32)", Description = "Converts the column to a 32-bit signed integer.")]
    Int32 = 1,

    [Display(Name = "Long (Int64)", Description = "Converts the column to a 64-bit signed integer.")]
    Int64 = 2,

    [Display(Name = "Decimal", Description = "Converts the column to a decimal (128-bit).")]
    Decimal = 3,

    [Display(Name = "Double", Description = "Converts the column to a double-precision floating point.")]
    Double = 4,

    [Display(Name = "DateTime", Description = "Converts the column to a date and time value.")]
    DateTime = 5,

    [Display(Name = "Boolean", Description = "Converts the column to a boolean value.")]
    Boolean = 6,

    [Display(Name = "Guid", Description = "Converts the column to a globally unique identifier.")]
    Guid = 7
}
