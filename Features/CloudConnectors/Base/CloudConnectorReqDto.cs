namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorReqDto
{
    public required string ConnectorProvider { get; set; } // e.g., SendGrid, OpenAI
    public required string ConnectorUniqueName { get; set; } // e.g., SendEmail, OpenAIInferencingRequest
    public required Guid CredentialId { get; set; } // Vault record ID
    public required Dictionary<string, object> ConnectorRequestPayload { get; set; } // The payload object (can be deserialized as needed)
}