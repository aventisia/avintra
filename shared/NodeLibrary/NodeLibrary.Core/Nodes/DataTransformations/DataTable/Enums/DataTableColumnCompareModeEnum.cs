namespace NodeLibrary.DataTableNodes.Enums;

public enum DataTableColumnCompareModeEnum
{
    [Display(Name = "All Columns", Description = "Compare all columns in the data table.")]
    AllColumns = 0,

    [Display(Name = "Selected Columns", Description = "Compare only selected columns.")]
    SelectedColumns = 1
}
