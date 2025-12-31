using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum ExcelResizeTypeEnum
    {
        [Display(Name = "Columns", Description = "Resizes the width of the selected columns.")]
        Columns,

        [Display(Name = "Rows", Description = "Resizes the height of the selected rows.")]
        Rows
    }
}