namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelSelectionModeForColorEnum
{
    [Display(Name = "Single Cell", Description = "Colors a single cell by column and row.")]
    SingleCell,

    [Display(Name = "Range of Cells", Description = "Colors a specified range (e.g., 'A1:B10').")]
    RangeOfCells,

    [Display(Name = "Named Cells", Description = "Colors cells based on named ranges.")]
    NamedCells
}
