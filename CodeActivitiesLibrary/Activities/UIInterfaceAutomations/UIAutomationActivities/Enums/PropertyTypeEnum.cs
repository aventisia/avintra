using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Enums
{
    public enum PropertyTypeEnum
    {
        [Display(Name = "ID", Description = "Find element by its automation ID.")]
        AutomationId = 1,

        [Display(Name = "Name", Description = "Find element by its visible name.")]
        Name = 2,

        [Display(Name = "Class Name", Description = "Find element by its class name.")]
        ClassName = 0,

        [Display(Name = "Control Type", Description = "Find element by its control type (e.g., button, textbox).")]
        ControlType = 3
    }
}