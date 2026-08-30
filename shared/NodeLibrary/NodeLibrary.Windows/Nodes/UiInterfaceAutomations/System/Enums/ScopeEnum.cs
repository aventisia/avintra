using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.SystemNodes.Enums;

public enum ScopeEnum
{
    [Display(Name = "User", Description = "Environment variables specific to the current user.")]
    User,

    [Display(Name = "System", Description = "Environment variables for the entire system (machine-level).")]
    System
}
