namespace MLModelBuilderAPIs.DTOs;

    /// <summary>
    /// Represents a request to execute a model for extracting data from files.
    /// </summary>
    /// <remarks>
    /// This DTO contains the model ID, an optional task ID, and a list of file IDs 
    /// that need to be processed by the specified model. It is typically used to 
    /// apply an AI or machine learning model for extracting information from multiple documents.
    /// </remarks>
    public class ModelExecutionRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the model used in the extraction process.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the optional task ID associated with the model execution request.
    /// </summary>
    public Guid? ModelTaskId { get; set; }

    /// <summary>
    /// Gets or sets the list of file IDs to be processed and extracted by the model.
    /// </summary>
    public required List<Guid> FileIds { get; set; }
}