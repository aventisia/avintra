namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelRangesFormatEnum
{
    [Display(Name = "Specific Ranges", Description = "Uses explicit cell ranges (e.g., A1:A5).")]
    SpecificRanges,

    [Display(Name = "Named Cells", Description = "Uses named ranges (e.g., SourceRange, TargetRange).")]
    NamedCells
}
