namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Determines how a multi-row formula computes values by referencing neighbouring rows.
/// </summary>
public enum MultiRowFormulaTypeEnum
{
    [Display(Name = "Running Total", Description = "Cumulative sum of the column up to and including the current row.")]
    RunningTotal = 0,

    [Display(Name = "Previous Value", Description = "Uses the value from a row that is N rows before the current row.")]
    PreviousValue = 1,

    [Display(Name = "Next Value", Description = "Uses the value from a row that is N rows after the current row.")]
    NextValue = 2,

    [Display(Name = "Difference From Previous", Description = "Computes the current value minus the value from N rows before.")]
    DifferenceFromPrevious = 3,

    [Display(Name = "Moving Average", Description = "Computes the average of the current row and N preceding rows.")]
    MovingAverage = 4
}
