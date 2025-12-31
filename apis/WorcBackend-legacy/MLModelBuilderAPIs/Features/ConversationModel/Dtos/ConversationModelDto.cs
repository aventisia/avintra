namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the details of an conversation model used in machine learning tasks.
/// </summary>
public class ConversationModelDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the conversation model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated ai project version entity.
    /// </summary>
    public Guid? AIProjectVersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the conversation model.
    /// </summary>
    [StringLength(255)]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the conversation model. 
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the extraction task setup for the conversation model.
    /// </summary>
    public ConversationModelSetupTaskDto? AIPersona { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the conversation model was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who created the conversation model.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who last modified the conversation model.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created the conversation model.
    /// This field is optional.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the conversation model.
    /// This field is optional.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}
