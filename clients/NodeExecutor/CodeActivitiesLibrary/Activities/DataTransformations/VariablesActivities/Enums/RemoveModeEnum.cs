using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities.Enums
{
    public enum RemoveModeEnum
    {
        [Display(Name = "Index", Description = "Removes an item based on its position in the list.")]
        Index,

        [Display(Name = "Value", Description = "Removes an item based on its value.")]
        Value
    }
}