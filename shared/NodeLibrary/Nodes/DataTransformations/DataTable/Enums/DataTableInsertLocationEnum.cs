namespace NodeLibrary.DataTableNodes.Enums;

public enum DataTableInsertLocationEnum
{
    [Display(Name = "End of Data Table", Description = "Insert at the end of the data table.")]
    EndOfDataTable = 0,

    [Display(Name = "Before Column Index", Description = "Insert before a specific column index.")]
    BeforeColumnIndex = 1
}
