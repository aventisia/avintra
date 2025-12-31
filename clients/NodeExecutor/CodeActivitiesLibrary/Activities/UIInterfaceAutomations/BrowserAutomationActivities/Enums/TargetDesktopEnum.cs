using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums
{
    public enum TargetDesktopEnum
    {
        [Display(Name = "Local Computer", Description = "Launch browser on local machine.")]
        LocalComputer = 0

        // Extend this if needed for remote desktops
    }
}