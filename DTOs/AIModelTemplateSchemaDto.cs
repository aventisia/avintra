namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the schema for a machine learning model configuration, specifying essential details such as version, data object, and version number.
/// </summary>
public class AIModelTemplateSchemaDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the version of the model template schema.
    /// </summary>
    public required Guid VersionId { get; set; }

    /// <summary>
    /// Gets or sets the data object associated with the model template schema.
    /// </summary>
    public required object DataObject { get; set; }

    /// <summary>
    /// Gets or sets the version number of the model template schema.
    /// </summary>
    public required int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the list of LLM (Language Model) names associated with the model schema.
    /// </summary>
    public List<string> LLMNames { get; set; } = new List<string>();
}
