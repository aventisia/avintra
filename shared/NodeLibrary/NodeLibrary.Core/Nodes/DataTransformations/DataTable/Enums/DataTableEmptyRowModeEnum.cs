namespace NodeLibrary.DataTableNodes.Enums;

public enum DataTableEmptyRowModeEnum
{
    [Display(Name = "All Empty", Description = "Row is considered empty only if ALL specified cells are empty.")]
    AllEmpty = 0,

    [Display(Name = "Any Empty", Description = "Row is considered empty if ANY of the specified cells are empty.")]
    AnyEmpty = 1,

    [Display(Name = "Based on Specific Columns", Description = "Check only specific columns for emptiness.")]
    SpecificColumns = 2
}
