using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum ExcelSearchByEnum
    {
        [Display(Name = "Rows", Description = "Searches by rows.")]
        Rows,

        [Display(Name = "Columns", Description = "Searches by columns.")]
        Columns
    }
}