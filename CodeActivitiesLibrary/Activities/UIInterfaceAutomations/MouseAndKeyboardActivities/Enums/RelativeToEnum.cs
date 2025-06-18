using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities.Enums
{
    public enum RelativeToEnum
    {
        [Display(Name = "Screen", Description = "Captures the entire screen.")]
        Screen,

        [Display(Name = "Foreground Window", Description = "Captures the currently active window.")]
        ForegroundWindow
    }
}