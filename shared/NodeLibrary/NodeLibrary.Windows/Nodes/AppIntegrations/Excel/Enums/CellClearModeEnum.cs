namespace NodeLibrary.ExcelNodes.Enums;

public enum CellClearModeEnum
{
    [Display(Name = "Single Cell", Description = "Clears a specific cell by column and row.")]
    SingleCell,

    [Display(Name = "Named Cells", Description = "Clears cells based on a named range.")]
    NamedCells,

    [Display(Name = "Range of Cells", Description = "Clears a specified range (e.g., A1:B10).")]
    RangeOfCells,

    [Display(Name = "Range Relative to Active Cell", Description = "Clears cells relative to the active cell.")]
    RangeRelativeToActiveCell
}
