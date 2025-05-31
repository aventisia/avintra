using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum ExcelResizeTypeEnum
    {
        [Description("Resizes the width of the selected columns.")]
        Columns,

        [Description("Resizes the height of the selected rows.")]
        Rows
    }
}