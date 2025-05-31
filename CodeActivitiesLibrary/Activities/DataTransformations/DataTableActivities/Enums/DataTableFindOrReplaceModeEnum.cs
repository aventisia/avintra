using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    public enum DataTableFindOrReplaceModeEnum
    {
        [Display(Name = "Find", Description = "Locates values in the data table.")]
        Find = 0,

        [Display(Name = "Find and Replace", Description = "Locates and replaces values in the data table.")]
        FindAndReplace = 1
    }
}