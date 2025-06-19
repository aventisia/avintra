namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the data structure for an API key associated with a machine learning model.
/// </summary>
public class ModelAPIKeyDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the API key record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the API key used to access the associated ML model.
    /// </summary>
    [StringLength(256)]
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the identifier of the machine learning model linked to this API key.
    /// </summary>
    public required Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the API key record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who last modified the record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the display name of the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}
