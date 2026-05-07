namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelFileSaveModeEnum
{
    [Display(Name = "Save Document", Description = "Saves the active workbook in its current format.")]
    SaveDocument,

    [Display(Name = "Save Document As", Description = "Saves the active workbook to a specified path with a chosen format.")]
    SaveDocumentAs
}
