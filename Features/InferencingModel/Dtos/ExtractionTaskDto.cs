namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// DTO for extraction-type model tasks, including table and field metadata.
/// </summary>
public class ExtractionTaskDto : ModelTypeTaskDto
{
    /// <summary>
    /// Metadata about tables used in the extraction setup, if available.
    /// </summary>
    public List<TableMetadataDto>? Tables { get; set; }

    /// <summary>
    /// Setup configurations for fields to be extracted, if available.
    /// </summary>
    public List<FieldSetupDto>? Fields { get; set; }
}
