namespace NodeLibrary.BrowserAutomationNodes.Enums;

public enum WindowStateEnum
{
    [Display(Name = "Normal", Description = "Launch browser in normal state.")]
    Normal = 0,

    [Display(Name = "Maximized", Description = "Launch browser maximized.")]
    Maximized = 1,

    [Display(Name = "Minimized", Description = "Launch browser minimized.")]
    Minimized = 2
}