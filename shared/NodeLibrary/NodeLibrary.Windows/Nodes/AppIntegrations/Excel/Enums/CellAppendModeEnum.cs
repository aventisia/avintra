namespace NodeLibrary.ExcelNodes.Enums;

public enum CellAppendModeEnum
{
    [Display(Name = "To Named Cells", Description = "Appends data to a named range.")]
    ToNamedCells,

    [Display(Name = "To Active Sheet", Description = "Appends data to the active worksheet.")]
    ToActiveSheet
}
