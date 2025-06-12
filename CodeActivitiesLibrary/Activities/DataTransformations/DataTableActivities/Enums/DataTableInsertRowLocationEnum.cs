using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums
{
    public enum DataTableInsertRowLocationEnum
    {
        [Display(Name = "Before Row Index", Description = "Inserts the row before the specified index.")]
        BeforeRowIndex = 0,

        [Display(Name = "End of Data Table", Description = "Appends the row at the end of the data table.")]
        EndOfDataTable = 1
    }
}