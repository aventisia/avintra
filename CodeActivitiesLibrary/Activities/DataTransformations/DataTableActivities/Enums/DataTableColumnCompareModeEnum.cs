using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    public enum DataTableColumnCompareModeEnum
    {
        [Display(Name = "All Columns", Description = "Compares all columns to identify duplicates.")]
        AllColumns = 0,

        [Display(Name = "Selected Columns", Description = "Only compares the specified columns for duplicates.")]
        SelectedColumns = 1
    }
}