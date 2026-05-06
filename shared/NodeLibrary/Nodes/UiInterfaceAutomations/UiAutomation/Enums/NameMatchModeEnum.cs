namespace NodeLibrary.UiAutomationNodes.Enums;

public enum NameMatchModeEnum
{
    [Display(Name = "Equals", Description = "Match the name exactly.")]
    Equals = 0,

    [Display(Name = "Contains", Description = "Match if the name contains the specified text.")]
    Contains = 1,

    [Display(Name = "Starts With", Description = "Match if the name starts with the specified text.")]
    StartsWith = 2
}
