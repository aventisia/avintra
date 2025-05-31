using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum ExcelSearchModeEnum
    {
        [Display(Name = "Find", Description = "Locates text in the worksheet.")]
        Find,

        [Display(Name = "Find and Replace", Description = "Locates and replaces text in the worksheet.")]
        FindAndReplace
    }
}