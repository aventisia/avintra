namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents an agent with its identifier, name, and version.
/// </summary>
public class AgentInfoDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the agent.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the agent.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }
}