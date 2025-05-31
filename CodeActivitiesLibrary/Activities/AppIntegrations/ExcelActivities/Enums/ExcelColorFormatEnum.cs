using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public enum ExcelColorFormatEnum
    {
        [Display(Name = "Name", Description = "Uses predefined color names.")]
        Name,

        [Display(Name = "Hexadecimal Value", Description = "Uses hexadecimal RGB values.")]
        HexadecimalValue
    }
}