namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a tool associated with a specific flow version.
/// </summary>
public class FlowVersionToolDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the flow version tool.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the flow version to which the tool belongs.
    /// </summary>
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the tool.
    /// </summary>
    public required Guid ToolId { get; set; }

    /// <summary>
    /// Gets or sets the list of operations that are allowed for this tool.
    /// If <c>null</c> or empty, all operations may be permitted depending on the implementation.
    /// </summary>
    public List<string>? AllowedOperations { get; set; }

    /// <summary>
    /// Gets or sets the unique name of the credential used to authenticate the tool.
    /// </summary>
    public string? CredentialName { get; set; }
}