using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum WorksheetCopyModeEnum
    {
        [Display(Name = "Name", Description = "Copies the worksheet by its name.")]
        Name,

        [Display(Name = "Index", Description = "Copies the worksheet by its index.")]
        Index
    }
}