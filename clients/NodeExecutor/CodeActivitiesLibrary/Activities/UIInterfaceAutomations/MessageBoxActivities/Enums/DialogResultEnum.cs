using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities.Enums
{
    public enum DialogResultEnum
    {
        [Display(Name = "First Button", Description = "Represents the first button in a dialog.")]
        FirstButton,

        [Display(Name = "Second Button", Description = "Represents the second button in a dialog.")]
        SecondButton,

        [Display(Name = "Third Button", Description = "Represents the third button in a dialog.")]
        ThirdButton,

        [Display(Name = "OK", Description = "Represents the OK button in a dialog.")]
        OK,

        [Display(Name = "Cancel", Description = "Represents the Cancel button in a dialog.")]
        Cancel,

        [Display(Name = "Abort", Description = "Represents the Abort button in a dialog.")]
        Abort,

        [Display(Name = "Retry", Description = "Represents the Retry button in a dialog.")]
        Retry,

        [Display(Name = "Ignore", Description = "Represents the Ignore button in a dialog.")]
        Ignore,

        [Display(Name = "Yes", Description = "Represents the Yes button in a dialog.")]
        Yes,

        [Display(Name = "No", Description = "Represents the No button in a dialog.")]
        No
    }
}