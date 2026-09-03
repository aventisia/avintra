using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

/// <summary>
/// Deserialized shape of a single entry from the local
/// <c>CamelIntegrationCatalog.json</c> file. This DTO is the source of truth
/// for connector display metadata, operations, and authentication types used
/// during the Camel connector seeding workflow.
/// </summary>
public class CamelConnectorCatalogEntry
{
    /// <summary>
    /// Gets or sets the stable connector identifier (Camel component name),
    /// e.g. <c>azure-storage-blob</c>.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Maven artifact id for the Camel component.
    /// </summary>
    [JsonPropertyName("artifactId")]
    public string? ArtifactId { get; set; }

    /// <summary>
    /// Gets or sets the human-readable connector title used as the display label.
    /// </summary>
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the connector description.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the credential name used to identify the authentication type
    /// </summary>
    [JsonPropertyName("credentialName")]
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the comma-separated label/tag string from the catalog.
    /// </summary>
    [JsonPropertyName("label")]
    public string? Label { get; set; }

    /// <summary>
    /// Gets or sets the Camel URI syntax for the connector.
    /// </summary>
    [JsonPropertyName("syntax")]
    public string? Syntax { get; set; }

    /// <summary>
    /// Gets or sets the icon URL for the connector family.
    /// </summary>
    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    /// <summary>
    /// Gets or sets the supported operations exposed by the connector.
    /// </summary>
    [JsonPropertyName("operations")]
    public List<string>? Operations { get; set; }

    /// <summary>
    /// Gets or sets the supported authentication types.
    /// </summary>
    [JsonPropertyName("authTypes")]
    public List<string>? AuthTypes { get; set; }

    /// <summary>
    /// Gets or sets the sample authentication structure.
    /// </summary>
    [JsonPropertyName("sampleAuth")]
    public Dictionary<string, object>? SampleAuth { get; set; }

    /// <summary>
    /// Gets or sets the support level (Stable, Preview, Experimental).
    /// </summary>
    [JsonPropertyName("supportLevel")]
    public string? SupportLevel { get; set; }

    /// <summary>
    /// Returns the display label for the connector. Uses <see cref="Title"/>
    /// when present; otherwise falls back to the component <see cref="Name"/>.
    /// </summary>
    public string GetDisplayLabel()
    {
        return !string.IsNullOrWhiteSpace(Title) ? Title.Trim() : Name;
    }

    /// <summary>
    /// Returns the connector description. Uses <see cref="Description"/>
    /// when present; otherwise returns an empty string.
    /// </summary>
    public string GetDescription()
    {
        return Description?.Trim() ?? string.Empty;
    }

    /// <summary>
    /// Returns the list of supported operations, or an empty list when none
    /// are declared in the catalog entry.
    /// </summary>
    public IReadOnlyList<string> GetOperations()
    {
        return Operations ?? new List<string>();
    }

    /// <summary>
    /// Returns the first authentication type when available, or
    /// <c>"none"</c> when the catalog entry declares no authentication.
    /// </summary>
    public string GetPrimaryAuthType()
    {
        var first = AuthTypes?.FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));
        return string.IsNullOrWhiteSpace(first) ? "none" : first.Trim();
    }
}


