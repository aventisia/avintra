using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.TextActivities.Enums;

public enum StartIndexTypeEnum
{
    [Display(Name = "Start of Text", Description = "Starts extraction from the beginning of the text.")]
    StartOfText,

    [Display(Name = "Character Position",
        Description = "Specifies a zero-based character position to start extraction.")]
    CharacterPosition
}
