using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum ExcelCellSelectionModeEnum
    {
        [Display(Name = "Named Cells", Description = "Selects a named range of cells.")]
        NamedCells,

        [Display(Name = "Range of Cells", Description = "Selects a specific range of cells (e.g., 'A1:B10').")]
        RangeOfCells,

        [Display(Name = "Relative to Active Cell", Description = "Selects a range relative to the active cell.")]
        RelativeToActiveCell
    }
}