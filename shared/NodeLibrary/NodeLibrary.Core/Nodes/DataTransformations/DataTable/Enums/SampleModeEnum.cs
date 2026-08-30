namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Determines how rows are selected when sampling a data table.
/// </summary>
public enum SampleModeEnum
{
    [Display(Name = "First N Rows", Description = "Keeps the first N rows of the data table.")]
    FirstNRows = 0,

    [Display(Name = "Last N Rows", Description = "Keeps the last N rows of the data table.")]
    LastNRows = 1,

    [Display(Name = "Percentage", Description = "Keeps a percentage of the rows (randomly selected).")]
    Percentage = 2,

    [Display(Name = "Random N Rows", Description = "Keeps N rows selected at random.")]
    RandomNRows = 3
}
