namespace NodeLibrary.TextNodes.Enums;

public enum TrimModeEnum
{
    [Display(Name = "Whitespace Characters from the Beginning",
        Description = "Trims specified characters from the start of the text.")]
    TrimStart,

    [Display(Name = "Whitespace Characters from the End",
        Description = "Trims specified characters from the end of the text.")]
    TrimEnd,

    [Display(Name = "Whitespace Characters from Both Ends",
        Description = "Trims specified characters from both ends of the text.")]
    TrimBoth
}
