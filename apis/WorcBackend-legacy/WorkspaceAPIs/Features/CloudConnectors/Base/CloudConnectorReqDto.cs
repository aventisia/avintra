namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorReqDto
{
    /// <summary>
    /// Gets or sets the agent identifier.
    /// </summary>
    public required string AgentId { get; set; }
    
    /// <summary>
    /// Gets or sets the agent name.
    /// </summary>
    public required string AgentName { get; set; }
    
    /// <summary>
    /// Gets or sets the provider name.
    /// </summary>
    public required string Provider { get; set; }
    
    /// <summary>
    /// Gets or sets the action name.
    /// </summary>
    public required string Action { get; set; }
    
    /// <summary>
    /// Gets or sets the vault credential name.
    /// </summary>
    public string? CredentialName { get; set; }
    
    /// <summary>
    /// Gets or sets the request payload.
    /// </summary>
    public required Dictionary<string, object> Payload { get; set; }
}
