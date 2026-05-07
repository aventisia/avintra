namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelLaunchModeEnum
{
    [Display(Name = "Open Existing", Description = "Opens an existing Excel document.")]
    OpenExisting,

    [Display(Name = "New Workbook", Description = "Creates a new Excel workbook.")]
    NewWorkbook
}
