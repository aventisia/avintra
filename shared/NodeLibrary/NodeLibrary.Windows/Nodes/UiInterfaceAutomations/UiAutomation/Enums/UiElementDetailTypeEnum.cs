namespace NodeLibrary.UiAutomationNodes.Enums;

public enum UiElementDetailTypeEnum
{
    [Display(Name = "Bounding Rectangle", Description = "Get the bounding rectangle of the element.")]
    BoundingRectangle = 0,

    [Display(Name = "Clickable Point", Description = "Get the clickable point of the element.")]
    ClickablePoint = 1,

    [Display(Name = "Label Text", Description = "Get the text from a label element.")]
    LabelText = 2,

    [Display(Name = "Is Enabled", Description = "Check if the element is enabled.")]
    IsEnabled = 3,

    [Display(Name = "Is Offscreen", Description = "Check if the element is offscreen (not visible to the user).")]
    IsOffscreen = 4,

    [Display(Name = "Is Password", Description = "Check if the element is a password field.")]
    IsPassword = 5
}
