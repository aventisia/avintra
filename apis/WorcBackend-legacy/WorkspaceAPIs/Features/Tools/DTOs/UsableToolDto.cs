namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the slim, usable view of a tool for selection in flow configuration.
/// </summary>
public class UsableToolDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the tool.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the tool.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the tool.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the component is platform-managed or custom.
    /// </summary>
    public ComponentTypeEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the authentication method required by the tool.
    /// </summary>
    public ToolAuthenticationTypeEnum? AuthenticationType { get; set; }

    /// <summary>
    /// Gets or sets the unique name of the credential associated with the tool.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool has been verified.
    /// </summary>
    public bool IsVerified { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is disabled.
    /// </summary>
    public bool IsDisabled { get; set; }
}
