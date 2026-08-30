namespace NodeLibrary.UiAutomationNodes.Enums;

public enum ClickTypeEnum
{
    [Display(Name = "UI Automation Click", Description = "Click using UI Automation InvokePattern.")]
    UIAutomationClick = 0,

    [Display(Name = "Mouse Click", Description = "Click using mouse at the element's clickable point.")]
    MouseClick = 1
}
