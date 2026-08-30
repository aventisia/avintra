namespace NodeLibrary.BrowserAutomationNodes.Enums;

public enum LaunchModeEnum
{
    [Display(Name = "Launch New Instance", Description = "Launch a new Microsoft Edge browser session.")]
    LaunchNewInstance = 0,

    [Display(Name = "Attach to Running Instance", Description = "Attach to an existing browser window.")]
    AttachToRunningInstance = 1
}