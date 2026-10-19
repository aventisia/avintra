namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a custom UI builder project record.
/// </summary>
public class UiBuilderProjectDto
{
    /// <summary>
    /// Gets or sets the project record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the project. Max 255 characters.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the project. Max 500 characters.
    /// </summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the published project is visible to all users within the tenant.
    /// </summary>
    public bool IsPublishedTenantWide { get; set; }

    /// <summary>
    /// Gets or sets the pinned published version number, or null when the project is not published.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public int? PublishedVersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the data sources bound to the project. Managed through the data-connections endpoint;
    /// ignored on project insert and update.
    /// </summary>
    public List<UiBuilderDataConnectionDto> DataConnections { get; set; } = new();

    /// <summary>
    /// Gets or sets the number of generated versions stored for the project.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public int VersionCount { get; set; }

    /// <summary>
    /// Gets or sets the number of the newest generated version for the project, or 0 when none exist.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public int HeadVersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the project record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the project record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the project record was created.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the project record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the project record was last modified.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
