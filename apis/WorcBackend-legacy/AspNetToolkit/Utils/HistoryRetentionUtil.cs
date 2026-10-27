namespace AspNetToolkit.Utils;

/// <summary>
/// Resolves the history retention a deployment enforces and stores.
/// </summary>
public static class HistoryRetentionUtil
{
    public const int CommunityRetentionDays = 1;

    /// <summary>
    /// Returns the retention a stored subscription value grants: unlimited for <see cref="int.MaxValue"/>, never below one day.
    /// </summary>
    public static int GetStoredRetentionDays(int storedRetentionDays)
    {
        return storedRetentionDays == int.MaxValue
            ? int.MaxValue
            : Math.Max(1, storedRetentionDays);
    }

    /// <summary>
    /// Returns the retention the edition enforces and reports: the Community cap, otherwise the stored value.
    /// </summary>
    public static int GetEffectiveRetentionDays(bool isCommunityDeployment, int storedRetentionDays)
    {
        return isCommunityDeployment
            ? CommunityRetentionDays
            : GetStoredRetentionDays(storedRetentionDays);
    }
}
