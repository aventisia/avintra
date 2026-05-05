namespace NodeLibrary.FolderNodes.Enums;

public enum IfExistsActionEnum
{
    [Display(Name = "Do nothing", Description = "Skips the file if it already exists.")]
    DoNothing,

    [Display(Name = "Overwrite", Description = "Deletes the existing file and moves the new file.")]
    Overwrite,
}