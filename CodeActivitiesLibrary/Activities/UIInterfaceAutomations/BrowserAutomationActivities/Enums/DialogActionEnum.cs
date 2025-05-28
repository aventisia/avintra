using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    public enum DialogActionEnum
    {
        [Display(Name = "Close It", Description = "Automatically close any pop-up dialog that appears.")]
        CloseIt = 0,

        [Display(Name = "Press a Button", Description = "Press a specified button on the dialog.")]
        PressAButton = 1,

        [Display(Name = "Do Nothing", Description = "Ignore any pop-up dialog.")]
        DoNothing = 2,

        [Display(Name = "Close It / Press a Button", Description = "Close or press a button on the dialog.")]
        CloseOrPress = 3
    }
}