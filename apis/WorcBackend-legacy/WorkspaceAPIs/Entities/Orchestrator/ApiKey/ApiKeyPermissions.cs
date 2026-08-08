namespace WorkspaceAPIs.Entities;

/// <summary>
/// Fixed permission set for an API key. Stored as JSONB and mirrored on the frontend as ApiKeyPermissions.
/// </summary>
public class ApiKeyPermissions
{
    /// <summary>
    /// Allow runner apps to authenticate machines using this key.
    /// </summary>
    public bool MachineAuth { get; set; }

    /// <summary>
    /// Allow external apps to trigger webhook-based jobs with this key.
    /// </summary>
    public bool WebhookTrigger { get; set; }

    /// <summary>
    /// Allow posting new work items to queues using this key.
    /// </summary>
    public bool CreateQueueWorkItem { get; set; }

    /// <summary>
    /// Allow synchronous execution of published agents via API using this key.
    /// </summary>
    public bool CloudExecution { get; set; }
}
