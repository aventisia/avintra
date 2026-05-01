using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.TextActivities.Enums;

public enum StringJoinDelimiterTypeEnum
{
    [Display(Name = "Standard", Description = "Uses predefined delimiters like Comma, Semicolon, Pipe.")]
    Standard,

    [Display(Name = "Custom", Description = "Allows specifying a custom delimiter.")]
    Custom
}
