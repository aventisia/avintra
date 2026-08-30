namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelSearchModeEnum
{
    [Display(Name = "Find", Description = "Locates text in the worksheet.")]
    Find,

    [Display(Name = "Find and Replace", Description = "Locates and replaces text in the worksheet.")]
    FindAndReplace,

    [Display(Name = "All Cells", Description = "Searches all cells in the used range.")]
    AllCells,

    [Display(Name = "Range of Cells", Description = "Searches a specified range of cells.")]
    RangeOfCells
}
