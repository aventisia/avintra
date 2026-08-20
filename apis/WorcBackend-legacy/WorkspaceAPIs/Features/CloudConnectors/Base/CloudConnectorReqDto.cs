namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorReqDto
{
    public required string AgentId { get; set; } // The agent invoking the connector
    public required string AgentName { get; set; } // The name of the agent invoking the connector
    public required string Provider { get; set; } // e.g., SendGrid, OpenAI
    public required string Action { get; set; } // e.g., SendEmail, OpenAI inferencing request
    public required string CredentialName { get; set; } // Vault credential name (resolved by name)
    public required Dictionary<string, object> Payload { get; set; } // The payload object (can be deserialized as needed)
}