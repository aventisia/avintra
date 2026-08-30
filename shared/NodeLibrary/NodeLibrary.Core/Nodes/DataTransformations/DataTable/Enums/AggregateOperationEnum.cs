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
    Last = 9,

    [Display(Name = "Mode", Description = "Returns the most frequently occurring value.")]
    Mode = 10,

    [Display(Name = "Percentile", Description = "Returns the value below which a given percentage of the data falls.")]
    Percentile = 11,

    [Display(Name = "Weighted Average", Description = "Returns the weighted arithmetic mean of the numeric values.")]
    WeightedAverage = 12,

    [Display(Name = "Geometric Mean", Description = "Returns the geometric mean of the numeric values.")]
    GeometricMean = 13,

    [Display(Name = "Harmonic Mean", Description = "Returns the harmonic mean of the numeric values.")]
    HarmonicMean = 14,

    [Display(Name = "Variance", Description = "Returns the sample variance of the numeric values.")]
    Variance = 15,

    [Display(Name = "Population Standard Deviation", Description = "Returns the population standard deviation of the numeric values.")]
    PopulationStandardDeviation = 16,

    [Display(Name = "Skewness", Description = "Returns the sample skewness of the numeric values.")]
    Skewness = 17,

    [Display(Name = "Kurtosis", Description = "Returns the sample excess kurtosis of the numeric values.")]
    Kurtosis = 18
}
