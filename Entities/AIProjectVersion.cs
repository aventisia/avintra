namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a specific version of an AI project, including its metadata, business context, publication and archival status, accuracy, and associated resources and tasks.
/// Supports multi-tenancy.
/// </summary>
[Table("as_AIProjectVersions")]
public class AIProjectVersion : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant Id for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the project this version belongs to.
    /// </summary>
    public required Guid AIProjectId { get; set; }

    /// <summary>
    /// Gets or sets the version number assigned to this project version.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the business context about the AI project. Max 5000 characters.
    /// </summary>
    [MaxLength(5000)]
    public required string BusinessContext { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project version has been published.
    /// </summary>
    /// <remarks>
    /// - Once published, the project version cannot be modified.
    /// </remarks>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the project version was published.
    /// </summary>
    public DateTimeOffset? PublishedOn { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this version has been archived.
    /// </summary>
    /// <remarks>
    /// - Once archived, the project version cannot be used to create new versions out of it. <br/>
    /// - Only published versions can be archived.
    /// </remarks>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the project version was archived.
    /// </summary>
    public DateTimeOffset? ArchivedOn { get; set; }

    /// <summary>
    /// Gets or sets the accuracy of the project version. 
    /// </summary>
    /// <remarks>
    /// - The accuracy will be determined by user corrections made during the Review stage, and it will start as null until review submissions starts.
    /// - The accuracy is represented as a percentage value ranging from 1 to 100.
    /// </remarks>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the project entity associated with this version.
    /// </summary>
    [ForeignKey("AIProjectId")]
    public virtual AIProject? AIProject { get; set; }

    /// <summary>
    /// Gets or sets the uploaded/remote resources associated with this ai project version.
    /// </summary>
    public virtual ICollection<VersionResource>? Resources { get; set; }

    /// <summary>
    /// Gets or sets the tasks associated with this ai project version.
    /// </summary>
    public virtual ICollection<VersionTask>? Tasks { get; set; }
}

// namespace MLModelBuilderAPIs.Entities;

// /// <summary>
// /// Represents a specific version of a machine learning model within a tenant's workspace.
// /// </summary>
// public class MLModelVersion : BaseEntity, IMustHaveTenant
// {
//     /// <summary>
//     /// Gets or sets the unique identifier of the tenant associated with this version (used for multi-tenancy filtering).
//     /// </summary>
//     public Guid TenantId { get; set; }

//     /// <summary>
//     /// Gets or sets the version number assigned to this model version.
//     /// </summary>
//     public int VersionNumber { get; set; }

//     /// <summary>
//     /// Gets or sets the timestamp when this model version was published.
//     /// </summary>
//     public DateTimeOffset? PublishedOn { get; set; }

//     /// <summary>
//     /// Gets or sets a value indicating whether this version is locked and cannot be modified.
//     /// </summary>
//     public bool IsLocked { get; set; }

//     /// <summary>
//     /// Gets or sets a value indicating whether this version is currently in draft status.
//     /// </summary>
//     public bool IsDraft { get; set; }

//     /// <summary>
//     /// Gets or sets a value indicating whether this version has been published.
//     /// </summary>
//     public bool IsPublished { get; set; }

//     /// <summary>
//     /// Gets or sets a value indicating whether this version has been archived.
//     /// </summary>
//     public bool IsArchived { get; set; }

//     /// <summary>
//     /// Gets or sets the unique identifier of the machine learning model this version belongs to.
//     /// </summary>
//     public required Guid MLModelId { get; set; }

//     /// <summary>
//     /// Gets or sets the ML model entity associated with this version.
//     /// </summary>
//     [ForeignKey("MLModelId")]
//     public virtual MLModel? MLModel { get; set; }
// }
