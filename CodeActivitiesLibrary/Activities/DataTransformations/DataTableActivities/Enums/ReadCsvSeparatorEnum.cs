using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums
{
    public enum ReadCsvSeparatorEnum
    {
        [Display(Name = "Predefined", Description = "Uses the system default separator (comma).")]
        Predefined,

        [Display(Name = "Custom", Description = "Uses a custom separator specified by the user.")]
        Custom,

        [Display(Name = "Fixed Column Widths", Description = "Parses based on fixed column widths (not implemented).")]
        FixedColumnWidths
    }
}