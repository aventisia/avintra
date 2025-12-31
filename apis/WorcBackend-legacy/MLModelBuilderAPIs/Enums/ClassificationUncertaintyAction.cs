namespace MLModelBuilderAPIs.Enums;

/// <summary>
/// Defines the action to take when the classification process
/// cannot determine a clear match for a given item.
/// </summary>
public enum ClassificationUncertaintyAction
{
    /// <summary>
    /// Discard the item when no clear classification match is found.
    /// </summary>
    DiscardItem,

    /// <summary>
    /// Output the item on an extra or separate branch when no match is found.
    /// </summary>
    OutputToOtherBranch
}