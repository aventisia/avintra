namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelRetrieveModeEnum
{
    [Display(Name = "The value of a single cell", Description = "Reads a single cell by column and row.")]
    SingleCell,

    [Display(Name = "Values from a range of cells", Description = "Reads a specified range (e.g., 'A1:B10').")]
    RangeOfCells,

    [Display(Name = "Values from selection", Description = "Reads the currently selected cells.")]
    Selection,

    [Display(Name = "All available values from worksheet", Description = "Reads the entire used range.")]
    AllAvailableValues,

    [Display(Name = "Values of named cells", Description = "Reads values from named ranges.")]
    ValuesOfNamedCells
}
