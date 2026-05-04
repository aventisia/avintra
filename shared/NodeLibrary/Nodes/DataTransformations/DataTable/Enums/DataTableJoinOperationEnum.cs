namespace NodeLibrary.DataTableNodes.Enums;

public enum DataTableJoinOperationEnum
{
    [Display(Name = "Inner Join", Description = "Returns only rows that have matching values in both tables.")]
    Inner = 0,

    [Display(Name = "Left Join", Description = "Returns all rows from the first table, and matching rows from the second table.")]
    Left = 1,

    [Display(Name = "Full Join", Description = "Returns all rows from both tables, matching where possible.")]
    Full = 2
}
