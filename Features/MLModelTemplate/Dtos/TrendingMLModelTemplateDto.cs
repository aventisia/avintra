namespace MLModelBuilderAPIs.DTOs;

public class TrendingMLModelTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the ML model template.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of ML model. Max character is 50.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a description of the ML model template. Maximum length is 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of ML model.
    /// </summary>
    public string? Type { get; set; }

    /// <summary>
    /// Gets or sets the number of times this template has been used to create ML models.
    /// This helps track the popularity or frequency of use of the template.
    /// </summary>
    public int UsagesCount { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the machine learning model version.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this template was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created this template.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created this template.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this template.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}