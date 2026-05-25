namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the common structure for trending templates used in Machine Learning or Agent-based systems.
/// This base class encapsulates shared metadata used across different template types.
/// </summary>
public class TrendingTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the template.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the display name of the template.
    /// Maximum length: 255 characters.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the template.
    /// Maximum length: 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the functional purpose of the template (e.g., Workflow, Automation).
    /// </summary>
    public string? Purpose { get; set; }

    /// <summary>
    /// Gets or sets the structural category of the template (e.g., Block, Agent, Inferencing, Conversation, Generative).
    /// </summary>
    public string? Type { get; set; }

    /// <summary>
    /// Gets or sets the total number of times this template has been used.
    /// Helps track usage popularity.
    /// </summary>
    public int UsagesCount { get; set; }

    /// <summary>
    /// Gets or sets a collection of tags associated with the template.
    /// Useful for filtering, categorization, or search functionality.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the identifier for the specific version of the template.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the template is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who created the template.
    /// Used for display purposes only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the template.
    /// Used for display purposes only.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the template was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets a list of icons or avatars associated with the template.
    /// Each entry could be a URL or a base64-encoded image string.
    /// </summary>
    public List<string>? Icons { get; set; }
}
