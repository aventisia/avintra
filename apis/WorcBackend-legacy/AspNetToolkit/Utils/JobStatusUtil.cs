namespace AspNetToolkit.Utils;

/// <summary>
/// Provides utility methods and reusable lists for <see cref="JobStatusEnum"/>.
/// </summary>
public static class JobStatusUtil
{
    /// <summary>
    /// Gets the set of terminal (closing) job statuses. A job in any of these statuses is considered closed.
    /// </summary>
    public static IReadOnlyList<JobStatusEnum> TerminalStatuses { get; } = new[]
    {
        JobStatusEnum.Completed,
        JobStatusEnum.Failed,
        JobStatusEnum.Aborted,
        JobStatusEnum.Canceled,
        JobStatusEnum.Killed
    };

    /// <summary>
    /// Determines whether the specified job status represents a terminal (closed) state.
    /// </summary>
    /// <param name="status">The job status to evaluate.</param>
    /// <returns><c>true</c> if the status is terminal; otherwise, <c>false</c>.</returns>
    public static bool IsTerminal(this JobStatusEnum status) =>
        TerminalStatuses.Contains(status);
}
