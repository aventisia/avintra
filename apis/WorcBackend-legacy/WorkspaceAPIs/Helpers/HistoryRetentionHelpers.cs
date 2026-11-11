namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Resolves the history window a deployment may read.
/// </summary>
public static class HistoryRetentionHelpers
{
    /// <summary>
    /// Returns the earliest history timestamp a read may serve, or <see cref="DateTimeOffset.MinValue"/> when the edition keeps history unlimited.
    /// </summary>
    public static DateTimeOffset GetEarliestReadableDate(EnvironmentConfig environmentConfig)
    {
        if (!environmentConfig.IsCommunityDeployment)
            return DateTimeOffset.MinValue;

        // IMPORTANT NOTE: the Community cap is enforced here and not read from the database, so a
        // Community deployment cannot widen its history window by editing its subscription row.
        return DateTimeOffset.UtcNow.AddDays(-HistoryRetentionUtil.CommunityRetentionDays);
    }
}
