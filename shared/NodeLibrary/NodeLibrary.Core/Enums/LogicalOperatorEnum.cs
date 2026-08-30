namespace NodeLibrary.Enums;

/// <summary>
/// Logical operators for combining multiple RenderIf conditions
/// </summary>
public enum LogicalOperatorEnum
{
    /// <summary>
    /// All conditions must be true
    /// </summary>
    AND,

    /// <summary>
    /// At least one condition must be true
    /// </summary>
    OR
}