namespace NodeLibrary.DataTableNodes.Enums;

public enum ReadCsvSeparatorEnum
{
    [Display(Name = "Predefined", Description = "Use a predefined separator (comma by default).")]
    Predefined = 0,

    [Display(Name = "Custom", Description = "Use a custom separator string.")]
    Custom = 1,

    [Display(Name = "Fixed Column Widths", Description = "Use fixed column widths.")]
    FixedColumnWidths = 2
}
