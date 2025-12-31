namespace MLModelBuilderAPIs.DTOs;

public class ExtractRequestDto
{
    /// <summary>
    /// Gets or sets the model id for which the file is being extracted.
    /// </summary>
    /// <remarks>
    /// Model id is required to associate the file with the model and to retrieve the fields to be extracted. Also, it going to decide which llm model to be used for extraction.
    /// </remarks>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of file ids to be extracted.
    /// </summary>
    public required List<Guid> FileIds { get; set; }
}

