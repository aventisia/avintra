namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a specific version of a machine learning model within a tenant's workspace.
/// </summary>
public class MLModelVersion : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant associated with this version (used for multi-tenancy filtering).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this version is locked and cannot be modified.
    /// </summary>
    public bool IsLocked { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this version is currently in draft status.
    /// </summary>
    public bool IsDraft { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this version has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this version has been archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the machine learning model this version belongs to.
    /// </summary>
    public required Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the ML model entity associated with this version.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }

    /// <summary>
    /// Gets or sets the version number assigned to this model version.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the collection of ML model templates linked to this version.
    /// </summary>
    public virtual ICollection<MLModelTemplate>? MLModelTemplates { get; set; }
}
