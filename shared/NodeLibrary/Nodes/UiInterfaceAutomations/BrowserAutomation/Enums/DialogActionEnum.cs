namespace NodeLibrary.BrowserAutomationNodes.Enums;

public enum DialogActionEnum
{
    [Display(Name = "Close It", Description = "Automatically close any pop-up dialog that appears.")]
    CloseIt,

    [Display(Name = "Press a Button", Description = "Press a specified button on the dialog.")]
    PressAButton,

    [Display(Name = "Do Nothing", Description = "Ignore any pop-up dialog.")]
    DoNothing,

    [Display(Name = "Close It / Press a Button", Description = "Close or press a button on the dialog.")]
    CloseOrPress,

    [Display(Name = "Accept Alert", Description = "Accept the alert dialog that appears.")]
    AcceptAlert,

    [Display(Name = "Dismiss Alert", Description = "Dismiss the alert dialog that appears.")]
    DismissAlert
}