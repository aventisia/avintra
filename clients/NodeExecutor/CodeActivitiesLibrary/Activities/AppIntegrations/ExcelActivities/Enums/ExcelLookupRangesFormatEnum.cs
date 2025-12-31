using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums
{
    public enum ExcelLookupRangesFormatEnum
    {
        [Display(Name = "Named Cells", Description = "Uses named ranges for lookup.")]
        NamedCells,

        [Display(Name = "Specific Ranges", Description = "Uses explicit start/end columns/rows for lookup.")]
        SpecificRanges
    }
}