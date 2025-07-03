namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Request DTO for creating a review associated with an ML model.
/// </summary>
public class AddDocumentRequestDto
{
    /// <summary>
    /// List of file IDs to be uploaded.
    /// </summary>
    public required List<Guid> FileIds { get; set; }

    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>
    public required Guid MLModelId { get; set; }
}