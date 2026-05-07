namespace NodeLibrary.WordNodes.Enums;

public enum WriteLocationEnum
{
    [Display(Name = "Beginning of Word file", Description = "Writes content at the beginning of the document.")]
    BeginningOfWordFile,

    [Display(Name = "End of Word file", Description = "Writes content at the end of the document.")]
    EndOfWordFile,

    [Display(Name = "Before Bookmark", Description = "Writes content before the specified bookmark.")]
    BeforeBookmark,

    [Display(Name = "After Bookmark", Description = "Writes content after the specified bookmark.")]
    AfterBookmark
}
