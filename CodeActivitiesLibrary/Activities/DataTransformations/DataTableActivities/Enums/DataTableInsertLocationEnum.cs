using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    public enum DataTableInsertLocationEnum
    {
        [Display(Name = "Before Column Index", Description = "Inserts the column before the specified index.")]
        BeforeColumnIndex = 0,

        [Display(Name = "End of Data Table", Description = "Appends the column at the end of the data table.")]
        EndOfDataTable = 1
    }
}