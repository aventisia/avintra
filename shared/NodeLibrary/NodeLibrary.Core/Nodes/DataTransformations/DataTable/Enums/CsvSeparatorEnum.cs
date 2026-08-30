namespace NodeLibrary.DataTableNodes.Enums;

public enum CsvSeparatorEnum
{
    [Display(Name = "System Default", Description = "Uses the system's default separator.")]
    SystemDefault = 0,

    [Display(Name = "Comma", Description = "Uses ',' as column separator.")]
    Comma = 1,

    [Display(Name = "Semicolon", Description = "Uses ';' as column separator.")]
    Semicolon = 2,

    [Display(Name = "Tab", Description = "Uses tab character as column separator.")]
    Tab = 3
}
