using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum ExcelColumnResizeTypeEnum
    {
        [Display(Name = "Autofit", Description = "Automatically adjusts the size based on content.")]
        Autofit,

        [Display(Name = "Custom size", Description = "Sets a custom width or height.")]
        CustomSize
    }
}