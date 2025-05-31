using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum ExcelSearchByEnum
    {
        [Display(Name = "Rows", Description = "Searches by rows.")]
        Rows,

        [Display(Name = "Columns", Description = "Searches by columns.")]
        Columns
    }
}