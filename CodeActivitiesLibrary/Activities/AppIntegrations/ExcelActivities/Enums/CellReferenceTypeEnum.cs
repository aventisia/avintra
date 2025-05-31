using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum CellReferenceTypeEnum
    {
        [Description("Reference by cell address (e.g., A1, B2)")]
        CellAddress,

        [Description("Reference by named range")]
        NamedRange
    }
}