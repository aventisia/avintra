using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums
{
    public enum DataTableSearchByEnum
    {
        [Display(Name = "Everywhere", Description = "Searches all columns in the data table.")]
        Everywhere = 0,

        [Display(Name = "On Column", Description = "Searches a specific column in the data table.")]
        OnColumn = 1
    }
}