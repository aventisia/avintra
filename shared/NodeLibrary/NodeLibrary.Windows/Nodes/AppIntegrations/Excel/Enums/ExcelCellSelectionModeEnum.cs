namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelCellSelectionModeEnum
{
    [Display(Name = "Single Cell", Description = "Selects a single cell by column and row.")]
    SingleCell,

    [Display(Name = "Named Cells", Description = "Selects a named range of cells.")]
    NamedCells,

    [Display(Name = "Range of Cells", Description = "Selects a specific range of cells (e.g., 'A1:B10').")]
    RangeOfCells,

    [Display(Name = "All Cells", Description = "Selects all cells in the worksheet.")]
    AllCells,

    [Display(Name = "Relative to Active Cell", Description = "Selects a range relative to the active cell.")]
    RelativeToActiveCell
}
