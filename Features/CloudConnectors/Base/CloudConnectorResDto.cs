namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorResDto
{
    public required string ConnectorProvider { get; set; } // e.g., SendGrid, OpenAI
    public required string ConnectorUniqueName { get; set; } // e.g., SendEmail, OpenAIInferencingRequest
    public object? ConnectorResponsePayload { get; set; } // The payload object (can be deserialized as needed)
}