namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a data source bound to a custom UI builder project, stored inside the project's JSON column.
/// </summary>
public class UiBuilderDataConnection
{
    /// <summary>
    /// Gets or sets the identifier used by generated code to reach this connection. Max-64 characters.
    /// </summary>
    [MaxLength(64)]
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the connection type. Only "queue" is supported.
    /// </summary>
    [MaxLength(20)]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the ID of the bound queue.
    /// </summary>
    public Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the name of the bound queue, refreshed from the queue on save. Max-256 characters.
    /// </summary>
    [MaxLength(256)]
    public string QueueName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the environment of the bound queue ("dev" or "prod").
    /// </summary>
    [MaxLength(10)]
    public string EnvType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the allowed operations, a subset of "list", "get", "add", and "update".
    /// </summary>
    public List<string> Operations { get; set; } = new();

    /// <summary>
    /// Gets or sets how generated code loads data ("auto" or "manual").
    /// </summary>
    [MaxLength(20)]
    public string FetchMode { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the description that tells generated code what the data is for. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }
}
