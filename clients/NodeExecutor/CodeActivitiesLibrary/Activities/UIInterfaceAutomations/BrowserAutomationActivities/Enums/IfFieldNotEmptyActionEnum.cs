using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums
{
    public enum IfFieldNotEmptyActionEnum
    {
        [Display(Name = "Replace Text", Description = "Clears existing text and replaces it with new input.")]
        ReplaceText,

        [Display(Name = "Append Text", Description = "Adds new text to the end of existing text.")]
        AppendText
    }
}

