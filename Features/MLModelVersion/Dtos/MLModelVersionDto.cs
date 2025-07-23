namespace MLModelBuilderAPIs.DTOs;

public class MLModelVersionDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the machine learning model version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the ML model to which this version belongs.
    /// </summary>
    public required Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the version number associated with this particular model version.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when this model version was published.
    /// This property will be null if the version has not been published.
    /// </summary>
    public DateTimeOffset? PublishedOn { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether this model version is locked and cannot be modified.
    /// </summary>
    public bool IsLocked { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether this version is currently in a draft state.
    /// </summary>
    public bool IsDraft { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether this model version has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether this model version has been archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this model version was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created this model version.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who last modified this model version.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created this model version.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this model version.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}
