namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelFilterOperatorEnum
{
    [Display(Name = "Equals", Description = "Filters cells that equal the specified value.")]
    IsEqualTo,

    [Display(Name = "Does Not Equal", Description = "Filters cells that do not equal the specified value.")]
    DoesNotEqual,

    [Display(Name = "Greater Than", Description = "Filters cells greater than the specified value.")]
    GreaterThan,

    [Display(Name = "Greater Than or Equal To", Description = "Filters cells greater than or equal to the specified value.")]
    GreaterThanOrEqualTo,

    [Display(Name = "Less Than", Description = "Filters cells less than the specified value.")]
    LessThan,

    [Display(Name = "Less Than or Equal To", Description = "Filters cells less than or equal to the specified value.")]
    LessThanOrEqualTo,

    [Display(Name = "Contains", Description = "Filters cells containing the specified text.")]
    Contains,

    [Display(Name = "Does Not Contain", Description = "Filters cells not containing the specified text.")]
    DoesNotContain,

    [Display(Name = "Is Between", Description = "Filters cells between two specified values.")]
    IsBetween,

    [Display(Name = "Clear Filter", Description = "Clears the existing filter from the range.")]
    ClearFilter
}
