namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a custom UI builder generated version.
/// </summary>
public class UiBuilderVersionDto
{
    /// <summary>
    /// Gets or sets the version record's primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the project this version belongs to.
    /// </summary>
    [RequiredGuid]
    public required Guid UiBuilderProjectId { get; set; }

    /// <summary>
    /// Gets or sets the sequential version number within the project.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the prompt that produced this version.
    /// </summary>
    public required string PromptText { get; set; }

    /// <summary>
    /// Gets or sets the full standalone HTML document generated for this version.
    /// </summary>
    public required string GeneratedHtml { get; set; }

    /// <summary>
    /// Gets or sets the wire provider used for generation. Max 50 characters.
    /// </summary>
    [StringLength(50)]
    public required string Provider { get; set; }

    /// <summary>
    /// Gets or sets the model used for generation. Max 100 characters.
    /// </summary>
    [StringLength(100)]
    public required string Model { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the version record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the version record was created.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }
}
