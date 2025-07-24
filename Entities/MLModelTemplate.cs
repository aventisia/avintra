namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents an entity that holds data for an ML model template.
/// </summary>
public class MLModelTemplate : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant associated with this template.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the ML model template. Maximum length is 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a description of the ML model template. Maximum length is 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of the machine learning model.
    /// </summary>
    public ModelTypesEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the serialized configuration details of the model in JSON format.
    /// </summary>
    public string? ConfigJson { get; set; }

    /// <summary>
    /// Gets or sets the number of times this template has been used to create ML models.
    /// </summary>
    [Range(0, int.MaxValue)]
    public int UsagesCount { get; set; }

    /// <summary>
    /// Gets or sets the access type, which defines the user's access level within the flow.
    /// </summary>
    public AccessTypesEnum? AccessType { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the machine learning model version.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();
}
