namespace NodeLibrary.WordNodes.Enums;

public enum LaunchWordModeEnum
{
    [Display(Name = "Blank Document", Description = "Launches Word with a blank document.")]
    BlankDocument,

    [Display(Name = "Open Existing Document", Description = "Launches Word and opens the specified document.")]
    OpenExistingDocument
}
