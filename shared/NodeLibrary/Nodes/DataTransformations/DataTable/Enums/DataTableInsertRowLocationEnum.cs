namespace NodeLibrary.DataTableNodes.Enums;

public enum DataTableInsertRowLocationEnum
{
    [Display(Name = "End of Data Table", Description = "Insert row at the end.")]
    EndOfDataTable = 0,

    [Display(Name = "Before Row Index", Description = "Insert row before a specific index.")]
    BeforeRowIndex = 1
}
