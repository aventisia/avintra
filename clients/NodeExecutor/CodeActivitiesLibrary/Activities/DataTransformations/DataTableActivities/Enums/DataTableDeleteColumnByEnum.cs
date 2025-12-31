using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums
{
    public enum DataTableDeleteColumnByEnum
    {
        [Display(Name = "Name", Description = "Delete column by name.")]
        Name = 0,

        [Display(Name = "Index", Description = "Delete column by index.")]
        Index = 1
    }
}