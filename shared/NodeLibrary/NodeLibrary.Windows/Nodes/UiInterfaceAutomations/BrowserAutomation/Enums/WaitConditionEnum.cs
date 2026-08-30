namespace NodeLibrary.BrowserAutomationNodes.Enums;

public enum WaitConditionEnum
{
    [Display(Name = "Contain Element", Description = "Wait until the web page contains the specified UI element.")]
    ContainElement = 0,

    [Display(Name = "Not Contain Element",
        Description = "Wait until the web page no longer contains the specified UI element.")]
    NotContainElement = 1,

    [Display(Name = "Contain Text", Description = "Wait until the web page contains the specified text.")]
    ContainText = 2,

    [Display(Name = "Not Contain Text",
        Description = "Wait until the web page no longer contains the specified text.")]
    NotContainText = 3
}