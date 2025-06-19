namespace MLModelBuilderAPIs.DTOs;

public class ModelByAPIKeyDto
{
    /// <summary>
    /// Gets or sets the primary key for the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of ML model. Max character is 50.
    /// </summary>
    [StringLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of ML model.
    /// </summary>
    public ModelTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the type of LLM.
    /// </summary>/
    public string? LLM { get; set; }

    /// <summary>
    /// Gets or sets the description of ML model
    /// </summary>
    public string? Description { get; set; }
}