namespace MLModelBuilderAPIs.DTOs;

public class UploadedDocDto
{
    
    /// <summary>
    /// Gets or sets the primary key for the Uploaded doc.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of Uploaded file. Max character is 50.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of uploaded file. 
    /// </summary>
    public required string Extension { get; set; }

    /// <summary>
    /// Gets or sets the size of uploaded file. 
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets the path of uploaded file. 
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets the type of data which will be extracted from uploaded file. 
    /// </summary>
    public ExtractedDataType Type { get; set; }

    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>/
    public Guid MLModelId { get; set; }

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