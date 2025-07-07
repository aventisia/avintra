namespace MLModelBuilderAPIs.DTOs;

public class InferencingModelSetupDto
{
    /// <summary>
    /// Gets or sets the primary key for the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of ML model. Max character is 50.
    /// </summary>
    [StringLength(50)]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the description of ML model
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the description of ML model
    /// </summary>
    public required string BusinessContext { get; set; }

    /// <summary>
    /// Gets or sets the data model's fields JSON data in string format. The default value will be an empty object.
    /// </summary>
    public List<InferencingModelTaskDto>? Tasks { get; set; }

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


/// <summary>
/// DTO representing a model inference task, 
/// containing the type of the model and the specific task details.
/// </summary>
public class InferencingModelTaskDto
{
    /// <summary>
    /// Gets or sets the primary key for the ML model task.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Specifies the type of inferencing model (e.g., Extraction, LLM, etc.).
    /// </summary>
    public required InferencingModelTypesEnum Type { get; set; }

    /// <summary>
    /// The specific task details associated with the model type.
    /// This is a polymorphic object based on the value of <see cref="Type"/>.
    /// </summary>
    public required ModelTypeTaskDto Task { get; set; }
}

/// <summary>
/// Abstract base class for all model-specific task DTOs.
/// Each derived class should represent a distinct type of inferencing model task.
/// </summary>
public abstract class ModelTypeTaskDto
{
    /// <summary>
    /// The type of inferencing model this task represents.
    /// Must match the outer container’s <see cref="InferencingModelTaskDto.Type"/>.
    /// </summary>
    public required InferencingModelTypesEnum Type { get; set; }
}