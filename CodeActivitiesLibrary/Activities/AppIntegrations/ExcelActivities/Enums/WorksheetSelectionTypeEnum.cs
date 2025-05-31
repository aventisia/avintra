using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum WorksheetSelectionTypeEnum
    {
        [Description("Select worksheet by its name.")]
        Name,

        [Description("Select worksheet by its 1-based index.")]
        Index
    }
}