namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Determines how missing (null) values in a column are filled.
/// </summary>
public enum FillMethodEnum
{
    [Display(Name = "Constant", Description = "Replaces missing values with a constant value.")]
    Constant = 0,

    [Display(Name = "Previous Value", Description = "Carries forward the last non-null value (forward fill).")]
    PreviousValue = 1,

    [Display(Name = "Next Value", Description = "Uses the next non-null value (backward fill).")]
    NextValue = 2,

    [Display(Name = "Group Mean", Description = "Replaces missing values with the mean of the values within the group.")]
    GroupMean = 3
}
