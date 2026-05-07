namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelColumnResizeTargetEnum
{
    [Display(Name = "Columns", Description = "Resizes columns.")]
    Columns,

    [Display(Name = "Rows", Description = "Resizes rows.")]
    Rows,

    [Display(Name = "Both", Description = "Resizes both columns and rows.")]
    Both
}
