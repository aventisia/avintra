namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelCellWriteModeEnum
{
    [Display(Name = "On Specified Cell", Description = "Writes to a specific cell by column and row.")]
    OnSpecifiedCell,

    [Display(Name = "On Currently Active Cell", Description = "Writes to the currently active cell.")]
    OnCurrentlyActiveCell,

    [Display(Name = "On Named Cells", Description = "Writes to named ranges.")]
    OnNamedCells
}
