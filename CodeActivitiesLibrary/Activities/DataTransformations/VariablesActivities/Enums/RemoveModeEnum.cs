using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    public enum RemoveModeEnum
    {
        [Description("Removes an item based on its position in the list.")]
        Index,

        [Description("Removes an item based on its value.")]
        Value
    }
}