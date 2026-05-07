namespace NodeLibrary.WordNodes.Enums;

public enum CloseOptionEnum
{
    [Display(Name = "Do not save document", Description = "Closes the document without saving.")]
    DoNotSaveDocument,

    [Display(Name = "Save document", Description = "Saves the document before closing.")]
    SaveDocument,

    [Display(Name = "Save document as", Description = "Saves the document with a new name before closing.")]
    SaveDocumentAs
}
