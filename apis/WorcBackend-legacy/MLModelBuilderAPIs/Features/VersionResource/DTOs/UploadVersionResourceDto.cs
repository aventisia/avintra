namespace MLModelBuilderAPIs.DTOs;

public class UploadVersionResourceDto
{
    /// <summary>
    /// List of files to be uploaded.
    /// </summary>
    public required List<IFormFile> Files { get; set; }

    /// <summary>
    /// Gets or sets the type of data which will be extracted from uploaded file. 
    /// </summary>
    public ExtractedDataType Type { get; set; }

    /// <summary>
    /// Gets or sets the stage of the document's workflow.
    /// </summary>
    public DocumentStageTypesEnum Stage { get; set; }

    /// <summary>
    /// Gets or sets the intended purpose of the uploaded documents.
    /// </summary>
    public DocumentPurposeTypesEnum Purpose { get; set; }

    /// <summary>
    /// Gets or sets the AI project version record's primary key to which this record is associated.
    /// </summary>
    public Guid AIProjectVersionId { get; set; }
}