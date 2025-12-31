namespace MLModelBuilderAPIs.DTOs;

public class MLModelTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the ML model template.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of ML model. Max character is 50.
    /// </summary>
    [StringLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a description of the ML model template. Maximum length is 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of ML model.
    /// </summary>
    public AIProjectTypeEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the number of times this template has been used to create ML models.
    /// </summary>
    public int UsagesCount { get; set; }

    /// <summary>
    /// Gets or sets the access type, which defines the user's access level within the ML model.
    /// </summary>
    public required AccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the machine learning model version.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the unique identifier for the version of the machine learning model.
    /// </summary>
    public Guid RefId { get; set; }

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
