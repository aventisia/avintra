using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    public enum DataTableJoinOperationEnum
    {
        [Display(
            Name = "Inner Join", Description = "Performs an inner join.")]
        Inner = 0,

        [Display(
            Name = "Left Outer Join", Description = "Performs a left outer join.")]
        Left = 1,

        [Display(
            Name = "Full Outer Join", Description = "Performs a full outer join.")]
        Full = 2
    }
}