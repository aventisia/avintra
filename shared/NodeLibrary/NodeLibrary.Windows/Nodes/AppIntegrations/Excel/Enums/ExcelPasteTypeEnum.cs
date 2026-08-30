namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelPasteTypeEnum
{
    [Display(Name = "All", Description = "Pastes all content including values, formulas, and formatting.")]
    All,

    [Display(Name = "Values", Description = "Pastes only cell values.")]
    Values,

    [Display(Name = "Formulas", Description = "Pastes only formulas.")]
    Formulas,

    [Display(Name = "Formats", Description = "Pastes only cell formatting.")]
    Formats,

    [Display(Name = "Comments", Description = "Pastes only cell comments.")]
    Comments
}
