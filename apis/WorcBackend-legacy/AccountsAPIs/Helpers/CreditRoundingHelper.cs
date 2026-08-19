namespace AccountsAPIs.Helpers;

/// <summary>
/// Helper for rounding credit-related values to two decimal places.
/// </summary>
public static class CreditRoundingHelper
{
    /// <summary>
    /// Rounds a credit or unit value to two decimal places using midpoint
    /// rounding away from zero for predictable results (0.005 becomes 0.01).
    /// </summary>
    public static double RoundToTwo(double value)
    {
        return Math.Round(value, 2, MidpointRounding.AwayFromZero);
    }
}
