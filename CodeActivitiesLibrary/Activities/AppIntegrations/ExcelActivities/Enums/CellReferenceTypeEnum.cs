using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum CellReferenceTypeEnum
    {
        [Display(Name = "Cell Address", Description = "Reference by cell address (e.g., A1, B2)")]
        CellAddress,

        [Display(Name = "Named Range", Description = "Reference by named range")]
        NamedRange
    }
}