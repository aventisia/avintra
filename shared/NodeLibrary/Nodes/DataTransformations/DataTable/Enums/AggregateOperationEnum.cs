namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Supported aggregation operations for summarizing and cross-tabbing data tables.
/// </summary>
public enum AggregateOperationEnum
{
    [Display(Name = "Sum", Description = "Returns the sum of the numeric values.")]
    Sum = 0,

    [Display(Name = "Count", Description = "Returns the number of non-null rows.")]
    Count = 1,

    [Display(Name = "Count Distinct", Description = "Returns the number of distinct non-null values.")]
    CountDistinct = 2,

    [Display(Name = "Minimum", Description = "Returns the smallest value.")]
    Min = 3,

    [Display(Name = "Maximum", Description = "Returns the largest value.")]
    Max = 4,

    [Display(Name = "Average", Description = "Returns the arithmetic mean of the numeric values.")]
    Average = 5,

    [Display(Name = "Median", Description = "Returns the median of the numeric values.")]
    Median = 6,

    [Display(Name = "Standard Deviation", Description = "Returns the sample standard deviation of the numeric values.")]
    StandardDeviation = 7,

    [Display(Name = "First", Description = "Returns the first non-null value.")]
    First = 8,

    [Display(Name = "Last", Description = "Returns the last non-null value.")]
    Last = 9
}
