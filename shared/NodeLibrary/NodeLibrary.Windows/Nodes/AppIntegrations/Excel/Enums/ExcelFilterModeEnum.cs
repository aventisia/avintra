namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelFilterModeEnum
{
    [Display(Name = "Active Sheet", Description = "Applies filter on the entire active sheet.")]
    ActiveSheet,

    [Display(Name = "Specific Range", Description = "Applies filter on a specified range (e.g., A1:B10).")]
    SpecificRange,

    [Display(Name = "Named Cells", Description = "Applies filter on named ranges.")]
    NamedCells,

    [Display(Name = "Table", Description = "Applies filter on Excel tables.")]
    Table
}
