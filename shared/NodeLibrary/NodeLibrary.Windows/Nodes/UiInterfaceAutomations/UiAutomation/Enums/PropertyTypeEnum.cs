namespace NodeLibrary.UiAutomationNodes.Enums;

public enum PropertyTypeEnum
{
    [Display(Name = "Name", Description = "Find element by its visible name.")]
    Name = 0,

    [Display(Name = "Class Name", Description = "Find element by its class name.")]
    ClassName = 1,

    [Display(Name = "Control Type", Description = "Find element by its control type (e.g., button, textbox).")]
    ControlType = 2,

    [Display(Name = "ID", Description = "Find element by its automation ID.")]
    AutomationId = 3,

    [Display(Name = "Framework ID", Description = "Find element by its framework ID (e.g., WPF, WinForms).")]
    FrameworkId = 4,
}
