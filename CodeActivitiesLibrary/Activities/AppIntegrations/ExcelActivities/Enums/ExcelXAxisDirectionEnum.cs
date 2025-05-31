using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum ExcelXAxisDirectionEnum
    {
        [Display(Name = "Left", Description = "Moves left from the active cell.")]
        Left,

        [Display(Name = "Right", Description = "Moves right from the active cell.")]
        Right
    }
}