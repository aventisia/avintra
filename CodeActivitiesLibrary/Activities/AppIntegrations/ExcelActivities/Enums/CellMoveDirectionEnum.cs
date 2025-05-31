using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum CellMoveDirectionEnum
    {
        [Display(Name = "Up", Description = "Moves upward from the current cell.")]
        Up,

        [Display(Name = "Down", Description = "Moves downward from the current cell.")]
        Down,

        [Display(Name = "Left", Description = "Moves left from the current cell.")]
        Left,

        [Display(Name = "Right", Description = "Moves right from the current cell.")]
        Right
    }
}