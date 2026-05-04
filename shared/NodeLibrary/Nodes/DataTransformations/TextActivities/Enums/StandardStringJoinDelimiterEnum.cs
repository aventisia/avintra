using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.TextActivities.Enums;

public enum StandardStringJoinDelimiterEnum
{
    [Display(Name = "None", Description = "Joins without any delimiter.")]
    None,

    [Display(Name = "Comma", Description = "Joins using a comma (',').")]
    Comma,

    [Display(Name = "Semicolon", Description = "Joins using a semicolon (';').")]
    Semicolon,

    [Display(Name = "Pipe", Description = "Joins using a pipe ('|').")]
    Pipe
}
