namespace NodeLibrary.WordNodes.Enums;

public enum ImageSourceEnum
{
    [Display(Name = "File", Description = "Inserts an image from a file path.")]
    File,

    [Display(Name = "Clipboard", Description = "Inserts an image from the system clipboard.")]
    Clipboard
}
