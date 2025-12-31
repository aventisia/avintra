namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents a request to execute a model for processing data from a list of files.
/// </summary>
/// <remarks>
/// This DTO contains the model ID, an optional task ID, and a list of file IDs 
/// that need to be processed by the model. It is used for processing data from 
/// multiple files via an AI or machine learning model.
/// </remarks>
public class ModelFileProcessingRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the model used in the extraction process.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated ai project version entity.
    /// </summary>
    public Guid AIProjectVersionId { get; set; }

    /// <summary>
    /// Gets or sets the list of task IDs associated with the model execution.
    /// </summary>
    public List<Guid>? ModelTaskIds { get; set; }

    /// <summary>
    /// Gets or sets the list of file IDs to be processed and extracted by the model.
    /// </summary>
    public required List<Guid> FileIds { get; set; }
}

/// <summary>
/// Represents a request to execute a model for processing data from either files or raw content.
/// </summary>
/// <remarks>
/// This DTO contains the model ID, an optional task ID, and either a list of file IDs 
/// or raw content to be processed by the model. It is used for extracting information from
/// multiple files or direct content input via an AI or machine learning model.
/// </remarks>
public class ModelContentProcessingRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the model used in the extraction process.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated ai project version entity.
    /// </summary>
    public Guid AIProjectVersionId { get; set; }

    /// <summary>
    /// Gets or sets the list of task IDs associated with the model execution.
    /// </summary>
    public List<Guid>? ModelTaskIds { get; set; }

    /// <summary>
    /// Gets or sets the content to be processed by the model. This is an alternative to providing file IDs.
    /// </summary>
    public string? Content { get; set; }

    /// <summary>
    /// Gets or sets the action type for the model execution.
    /// </summary>
    public ActionTypesEnum ActionType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the agent that triggered the model execution, if applicable.
    /// TODO: We can make this mandatory in future and make this dto dedicated to agent executions only.
    /// </summary>
    public string? TriggeredByAgent { get; set; }
}