namespace NodeLibrary.BrowserAutomationNodes.Enums;

public enum AttachModeEnum
{
    [Display(Name = "By Title", Description = "Attach to tab by its title.")]
    ByTitle = 0,

    [Display(Name = "By URL", Description = "Attach to tab by its URL.")]
    ByUrl = 1,

    [Display(Name = "Use Foreground Window", Description = "Attach to active tab in foreground window.")]
    UseForegroundWindow = 2
}