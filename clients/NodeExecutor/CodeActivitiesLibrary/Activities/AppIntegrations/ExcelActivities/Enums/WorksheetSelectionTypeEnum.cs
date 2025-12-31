using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum WorksheetSelectionTypeEnum
    {
        [Display(Name = "Name", Description = "Select worksheet by its name.")]
        Name,

        [Display(Name = "Index", Description = "Select worksheet by its 1-based index.")]
        Index
    }
}