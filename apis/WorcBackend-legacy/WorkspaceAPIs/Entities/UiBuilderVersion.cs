namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an append-only generated version of a custom UI builder project.
/// </summary>
[Table("uibuilder_Versions")]
public class UiBuilderVersion : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this version belongs to.
    /// Null indicates the version is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the project this version belongs to.
    /// </summary>
    public required Guid UiBuilderProjectId { get; set; }

    /// <summary>
    /// Gets or sets the project this version belongs to.
    /// </summary>
    [ForeignKey("UiBuilderProjectId")]
    public virtual UiBuilderProject? UiBuilderProject { get; set; }

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
    /// Gets or sets the output format marker for this version ("html" or "framework"). Max-20 characters.
    /// </summary>
    [MaxLength(20)]
    public required string ContentFormat { get; set; }

    /// <summary>
    /// Gets or sets the JSX source artifact for framework versions, or null for html versions.
    /// </summary>
    public string? SourceArtifact { get; set; }

    /// <summary>
    /// Gets or sets the wire provider used for generation. Max-50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string Provider { get; set; }

    /// <summary>
    /// Gets or sets the model used for generation. Max-100 characters.
    /// </summary>
    [MaxLength(100)]
    public required string Model { get; set; }

    /// <summary>
    /// Gets or sets an optional checkpoint name for the version. Max-100 characters.
    /// </summary>
    [MaxLength(100)]
    public string? Label { get; set; }
}
