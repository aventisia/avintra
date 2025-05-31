using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum ActivationModeEnum
    {
        [Description("Activate a cell using its exact row and column coordinates.")]
        Absolute,

        [Description(
            "Activate a cell relative to the currently active cell by moving a certain number of rows/columns.")]
        Relative,

        [Description("Activate a cell or range by its defined name.")]
        NamedRange
    }
}