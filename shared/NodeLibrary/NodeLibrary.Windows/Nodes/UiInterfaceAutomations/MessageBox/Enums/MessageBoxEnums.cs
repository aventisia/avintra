namespace NodeLibrary.MessageBoxNodes.Enums;

public enum MessageBoxIconEnum
{
    [Display(Name = "None", Description = "No icon is displayed.")]
    None,

    [Display(Name = "Information", Description = "An information icon (i).")]
    Information,

    [Display(Name = "Question", Description = "A question mark icon.")]
    Question,

    [Display(Name = "Warning", Description = "A warning icon (!).")]
    Warning,

    [Display(Name = "Error", Description = "An error icon (X).")]
    Error
}

public enum MessageBoxButtonsEnum
{
    [Display(Name = "OK", Description = "Displays an OK button.")]
    OK,

    [Display(Name = "OK - Cancel", Description = "Displays OK and Cancel buttons.")]
    OKCancel,

    [Display(Name = "Yes - No", Description = "Displays Yes and No buttons.")]
    YesNo,

    [Display(Name = "Yes - No - Cancel", Description = "Displays Yes, No, and Cancel buttons.")]
    YesNoCancel,

    [Display(Name = "Abort - Retry - Ignore", Description = "Displays Abort, Retry, and Ignore buttons.")]
    AbortRetryIgnore,

    [Display(Name = "Retry - Cancel", Description = "Displays Retry and Cancel buttons.")]
    RetryCancel
}

public enum DefaultButtonEnum
{
    [Display(Name = "First Button", Description = "The first button is the default.")]
    Button1 = 0,

    [Display(Name = "Second Button", Description = "The second button is the default.")]
    Button2 = 1,

    [Display(Name = "Third Button", Description = "The third button is the default.")]
    Button3 = 2
}
