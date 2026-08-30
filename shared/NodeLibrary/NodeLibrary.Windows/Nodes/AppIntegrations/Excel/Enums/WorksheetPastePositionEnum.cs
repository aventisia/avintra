namespace NodeLibrary.ExcelNodes.Enums;

public enum WorksheetPastePositionEnum
{
    [Display(Name = "First worksheet", Description = "Pastes the worksheet as the first sheet in the target workbook.")]
    FirstWorksheet,

    [Display(Name = "Last worksheet", Description = "Pastes the worksheet as the last sheet in the target workbook.")]
    LastWorksheet
}
