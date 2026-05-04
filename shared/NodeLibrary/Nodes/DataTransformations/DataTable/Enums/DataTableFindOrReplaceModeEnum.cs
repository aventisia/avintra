namespace NodeLibrary.DataTableNodes.Enums;

public enum DataTableFindOrReplaceModeEnum
{
    [Display(Name = "Find", Description = "Find matching values in the data table.")]
    Find = 0,

    [Display(Name = "Find and Replace", Description = "Find and replace values in the data table.")]
    FindAndReplace = 1
}
