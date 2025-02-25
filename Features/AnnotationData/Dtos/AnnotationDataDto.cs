namespace MLModelBuilderAPIs.Dtos;

/// <summary>
/// Represents an Annotation data dto model 
/// </summary>
public class AnnotationDataDto 
{
     /// <summary>
    /// Gets or sets the primary key for the data model
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>/
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the ML uploaded doc record's primary key to which this record is associated.
    /// </summary>/
    public Guid UploadedDocId { get; set; }

    /// <summary>
    /// Gets or sets the data model's fields JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? AnnotationObject { get; set; }

    /// <summary>
    /// Gets or sets the date of creation of extracted data.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who modified the record last.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

}