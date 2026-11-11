namespace WorkspaceAPIs.Helpers;

public static class FlowVersionHistoryHelpers
{
    /// <summary>
    /// Returns the advisory lock key that serializes writers of one flow version's history.
    /// </summary>
    public static string HistoryLockKey(Guid flowVersionId) => $"flow-version-history:{flowVersionId:N}";
}
