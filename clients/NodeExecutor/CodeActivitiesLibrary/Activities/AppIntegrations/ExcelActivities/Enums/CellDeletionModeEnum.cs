using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum CellDeletionModeEnum
    {
        [Display(Name = "Single Cell", Description = "Deletes a specific cell by column and row.")]
        SingleCell,

        [Display(Name = "Range of Cells", Description = "Deletes a specified range (e.g., A1:B10).")]
        RangeOfCells
    }
}