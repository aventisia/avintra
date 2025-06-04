using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    public enum WindowStateEnum
    {
        [Display(Name = "Maximized", Description = "Launches browser in maximized window state.")]
        Maximized,

        [Display(Name = "Minimized", Description = "Launches browser in minimized window state.")]
        Minimized,

        [Display(Name = "Normal", Description = "Launches browser in normal window state.")]
        Normal
    }
}