using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.TextActivities.Enums;

public enum PadDirection
{
    [Display(Name = "Left", Description = "Pad the text on the left side.")]
    Left,

    [Display(Name = "Right", Description = "Pad the text on the right side.")]
    Right
}
