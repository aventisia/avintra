namespace MLModelBuilderAPIs.DTOs;

public class PublishMLModelTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the machine learning model template.
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
    public ModelTypesEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the access type, which defines the user's access level within the ml model.
    /// </summary>
    public required AccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the space that the model version belongs to.
    /// </summary>
    public List<Guid>? SpaceIds { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the version of the machine learning model.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the machine learning model version.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();
}