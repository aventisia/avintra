using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    public enum TargetDesktopEnum
    {
        [Display(Name = "Local Computer", Description = "Launch browser on local machine.")]
        LocalComputer = 0

        // Extend this if needed for remote desktops
    }
}