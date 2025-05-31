using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum ExcelColumnResizeTargetEnum
    {
        [Display(Name = "Columns", Description = "Resizes columns.")]
        Columns,

        [Display(Name = "Rows", Description = "Resizes rows.")]
        Rows
    }
}