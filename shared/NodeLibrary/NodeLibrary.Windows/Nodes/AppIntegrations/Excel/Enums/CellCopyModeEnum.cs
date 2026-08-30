namespace NodeLibrary.ExcelNodes.Enums;

public enum CellCopyModeEnum
{
    [Display(Name = "Single Cell", Description = "Copies a specific cell by column and row.")]
    SingleCell,

    [Display(Name = "Named Cells", Description = "Copies values from named ranges.")]
    NamedCells,

    [Display(Name = "Selection", Description = "Copies the currently selected range.")]
    Selection,

    [Display(Name = "Range of Cells", Description = "Copies a specified range (e.g., A1:B10).")]
    RangeOfCells
}
