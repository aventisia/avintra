using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities.Enums
{
    // Define the GetFieldByEnum with Display attributes
    public enum GetFieldByEnum
    {
        [Display(Name = "Label", Description = "Identify the field by its label.")]
        Label,

        [Display(Name = "Index", Description = "Identify the field by its index.")]
        Index,

        [Display(Name = "Position", Description = "Identify the field by its position.")]
        Position
    }
}