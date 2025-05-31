using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    public enum DataTableSortColumnByEnum
    {
        [Display(Name = "Name", Description = "Sort column by name.")]
        Name = 0,

        [Display(Name = "Index", Description = "Sort column by index.")]
        Index = 1
    }
}