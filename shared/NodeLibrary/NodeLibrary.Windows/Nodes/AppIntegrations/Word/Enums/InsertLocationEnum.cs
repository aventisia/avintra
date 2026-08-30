namespace NodeLibrary.WordNodes.Enums;

public enum InsertLocationEnum
{
    [Display(Name = "Beginning of Word file", Description = "Inserts content at the beginning of the document.")]
    BeginningOfWordFile,

    [Display(Name = "End of Word file", Description = "Inserts content at the end of the document.")]
    EndOfWordFile,

    [Display(Name = "Before Bookmark", Description = "Inserts content before the specified bookmark.")]
    BeforeBookmark,

    [Display(Name = "After Bookmark", Description = "Inserts content after the specified bookmark.")]
    AfterBookmark,

    [Display(Name = "Before Specific Text", Description = "Inserts content before a specific text in the document.")]
    BeforeSpecificText,

    [Display(Name = "After Specific Text", Description = "Inserts content after a specific text in the document.")]
    AfterSpecificText
}
