namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelCloseOptionEnum
{
    [Display(Name = "Do not save document", Description = "Closes Excel without saving changes.")]
    DoNotSaveDocument,

    [Display(Name = "Save document", Description = "Saves changes before closing Excel.")]
    SaveDocument,

    [Display(Name = "Save document as", Description = "Saves the document to a specified path before closing Excel.")]
    SaveDocumentAs
}
