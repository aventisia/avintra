namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorReqDto
{
    public required string AgentId { get; set; }
    public required string AgentName { get; set; }
    public required string Provider { get; set; }
    public required string Action { get; set; }
    public required string CredentialName { get; set; }
    public required Dictionary<string, object> Payload { get; set; }
}
