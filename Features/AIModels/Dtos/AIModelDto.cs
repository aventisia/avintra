namespace MLModelBuilderAPIs.DTOs;

public class AIModelDto
{
    /// <summary>
    /// Gets or sets the primary key for the AI project version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of AI model. Max character is 50.
    /// </summary>
    [StringLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of AI model.
    /// </summary>
    public AIProjectTypeEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the type of LLM.
    /// </summary>/
    public List<string>? LLMs { get; set; }

    /// <summary>
    /// Gets or sets the description of AI model
    /// </summary>
    public string? Description { get; set; }
}