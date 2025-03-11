namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents a dto model for LLM entity
/// </summary>
public class LLMDto
{
    /// <summary>
    /// Gets or sets the primary key for the LLM.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of LLM. Max character is 50.
    /// </summary>
    [StringLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the date of creation of LLM.
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