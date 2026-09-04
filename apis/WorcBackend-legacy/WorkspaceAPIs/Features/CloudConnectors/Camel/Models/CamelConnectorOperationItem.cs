using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

/// <summary>
/// Operation summary returned by the Camel harness
/// <c>GET /api/connectors/{connector}/operations</c> endpoint.
/// </summary>
public class CamelConnectorOperationItem
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}
