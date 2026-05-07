namespace NodeLibrary.ExcelNodes.Enums;

public enum ActivationModeEnum
{
    [Display(Name = "Activate by Name", Description = "Activate a cell using its exact row and column coordinates.")]
    Absolute,

    [Display(Name = "Activate by Offset", Description = "Activate a cell relative to the currently active cell by moving a certain number of rows/columns.")]
    Relative,

    [Display(Name = "Activate by Named Range", Description = "Activate a cell or range by its defined name.")]
    NamedRange
}
