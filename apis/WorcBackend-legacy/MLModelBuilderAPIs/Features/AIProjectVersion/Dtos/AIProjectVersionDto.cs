namespace MLModelBuilderAPIs.DTOs;

public class AIProjectVersionDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the machine learning model version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of ML model. Max character is 50.
    /// </summary>
    [StringLength(50)]
    public string? Name { get; set; }

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
