namespace NodeLibrary.UiAutomationNodes.Enums;

public enum FillMethodEnum
{
    [Display(Name = "Type", Description = "Type the text into the field.")]
    Typing = 1,

    [Display(Name = "Paste", Description = "Paste the text into the field.")]
    Paste = 2,

    [Display(Name = "Set Value", Description = "Set the value directly (if supported).")]
    SetValue = 3
}
