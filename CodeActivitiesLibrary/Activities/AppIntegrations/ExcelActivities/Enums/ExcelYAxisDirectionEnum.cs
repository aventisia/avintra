using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum ExcelYAxisDirectionEnum
    {
        [Display(Name = "Above", Description = "Moves above the active cell.")]
        Above,

        [Display(Name = "Below", Description = "Moves below the active cell.")]
        Below
    }
}