namespace NodeLibrary.DataTableNodes.Enums;

public enum DataTableSearchByEnum
{
    [Display(Name = "Everywhere", Description = "Search in all columns.")]
    Everywhere = 0,

    [Display(Name = "On Column", Description = "Search in a specific column.")]
    OnColumn = 1
}
