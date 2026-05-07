namespace NodeLibrary.ExcelNodes.Enums;

public enum CellDeletionModeEnum
{
    [Display(Name = "Single Cell", Description = "Deletes a specific cell by column and row.")]
    SingleCell,

    [Display(Name = "Range of Cells", Description = "Deletes a specified range (e.g., A1:B10).")]
    RangeOfCells,

    [Display(Name = "Rows", Description = "Deletes entire rows.")]
    Rows,

    [Display(Name = "Columns", Description = "Deletes entire columns.")]
    Columns
}
