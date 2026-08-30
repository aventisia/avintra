namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelFileSaveModeEnum
{
    [Display(Name = "Save", Description = "Saves the active workbook in its current format.")]
    Save,

    [Display(Name = "Save a Copy", Description = "Saves the active workbook to a specified path with a chosen format.")]
    SaveCopy,
}
