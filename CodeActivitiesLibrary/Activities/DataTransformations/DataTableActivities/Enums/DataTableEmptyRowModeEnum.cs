using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums
{
    public enum DataTableEmptyRowModeEnum
    {
        [Display(Name = "All Cells Empty", Description = "Deletes rows where all specified cells are empty.")]
        AllEmpty = 0,

        [Display(Name = "Any Cell Empty", Description = "Deletes rows where any specified cell is empty.")]
        AnyEmpty = 1,

        [Display(Name = "Based on Specific Columns",
            Description = "Deletes rows based on emptiness in specific columns.")]
        SpecificColumns = 2
    }
}