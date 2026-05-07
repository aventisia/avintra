namespace NodeLibrary.ExcelNodes.Enums;

public enum CellPasteModeEnum
{
    [Display(Name = "On Named Cells", Description = "Pastes data into a named range.")]
    OnNamedCells,

    [Display(Name = "On Currently Active Cell", Description = "Pastes data starting from the currently active cell.")]
    OnCurrentlyActiveCell,

    [Display(Name = "On Specified Cell", Description = "Pastes data starting from a specific column and row.")]
    OnSpecifiedCell
}
