namespace NodeLibrary.WordNodes.Enums;

public enum RetrieveOptionEnum
{
    [Display(Name = "Whole Document", Description = "Retrieves the entire content of the document.")]
    WholeDocument,

    [Display(Name = "Pages", Description = "Retrieves content based on specified page numbers.")]
    Pages,

    [Display(Name = "Bookmark", Description = "Retrieves content located within a specific bookmark.")]
    Bookmark
}
