using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.TextActivities.Enums;

public enum CropModeEnum
{
    [Display(Name = "Before Flag", Description = "Get text before the first occurrence of the flag.")]
    BeforeFlag,

    [Display(Name = "After Flag", Description = "Get text after the last occurrence of the flag.")]
    AfterFlag,

    [Display(Name = "Between Flags", Description = "Get text between two flags.")]
    BetweenFlags
}
