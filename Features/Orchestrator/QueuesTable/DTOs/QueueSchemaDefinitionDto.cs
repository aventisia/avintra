namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Defines a field in a queue schema, including name, type, and validation rules.
/// </summary>
public class QueueSchemaDefinitionDto
{
    /// <summary>
    /// Gets or sets the internal field name (e.g., InvoiceNumber).
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a brief description of the field.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the label shown to users.
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Gets or sets the data type (e.g., string, number, date).
    /// </summary>
    public string? Type { get; set; }

    /// <summary>
    /// Gets or sets a value indicating if the field is required.
    /// </summary>
    public bool IsRequired { get; set; }

    /// <summary>
    /// Gets or sets a value indicating if the field must be unique.
    /// </summary>
    public bool IsUsedForUniqueData { get; set; }
}
