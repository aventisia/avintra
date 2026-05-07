namespace NodeLibrary.WordNodes.Enums;

public enum SaveModeEnum
{
    [Display(Name = "Save Document", Description = "Saves the current document with its existing name.")]
    SaveDocument,

    [Display(Name = "Save Document As", Description = "Saves the document with a new name or location.")]
    SaveDocumentAs
}
