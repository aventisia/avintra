using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum WorksheetDeleteByModeEnum
    {
        [Display(Name = "Name", Description = "Deletes the worksheet by its name.")]
        Name,

        [Display(Name = "Index", Description = "Deletes the worksheet by its index.")]
        Index
    }
}