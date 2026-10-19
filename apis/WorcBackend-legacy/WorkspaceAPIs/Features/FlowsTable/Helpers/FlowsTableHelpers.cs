namespace WorkspaceAPIs.Helpers;

public static class FlowsTableHelpers
{
    /// <summary>
    /// Projects the latest modification time across a flow and its versions.
    /// </summary>
    public static readonly Expression<Func<Flow, DateTimeOffset?>> LatestModifiedOn = flow =>
        flow.FlowVersions!.Any(v => v.LastModifiedOn > flow.LastModifiedOn)
            ? flow.FlowVersions!.Max(v => v.LastModifiedOn)
            : flow.LastModifiedOn;

    /// <summary>
    /// Projects the number of non-archived versions of a flow.
    /// </summary>
    public static readonly Expression<Func<Flow, int>> ActiveVersionCount = flow =>
        flow.FlowVersions!.Count(v => !v.IsArchived);
}
