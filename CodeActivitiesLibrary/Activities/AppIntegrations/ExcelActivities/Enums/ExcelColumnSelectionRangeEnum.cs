using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum ExcelColumnSelectionRangeEnum
    {
        [Display(Name = "All available", Description = "Resizes all columns or rows in the worksheet.")]
        AllAvailable,

        [Display(Name = "Range", Description = "Resizes a specified range of columns or rows.")]
        Range,

        [Display(Name = "Single", Description = "Resizes a single column or row.")]
        Single
    }
}