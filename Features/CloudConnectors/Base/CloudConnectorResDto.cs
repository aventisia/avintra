namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorResDto
{
    public required string Provider { get; set; } // e.g., SendGrid, OpenAI
    public required string Action { get; set; } // e.g., SendEmail, OpenAIInferencingRequest
    public object? Payload { get; set; } // The payload object (can be deserialized as needed)
}