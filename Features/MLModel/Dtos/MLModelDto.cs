namespace MLModelBuilderAPIs.DTOs;

public class MLModelDto
{
    /// <summary>
    /// Gets or sets the primary key for the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the Id of the project to which the flow record belongs.
    /// </summary>
    [RequiredGuid]
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Gets or sets the name of ML model. Max character is 50.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of ML model.
    /// </summary>
    public ModelTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the type of LLM.
    /// </summary>/
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the documents processed for this record
    /// </summary>
    public int? DocsProcessed { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the description of ML model
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the date of training of ML model.
    /// </summary>
    public DateTimeOffset TrainedOn { get; set; }

    /// <summary>
    ///Gets or sets the status of ML model.
    /// </summary>/
    public ModelStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the date of creation of ML model.
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