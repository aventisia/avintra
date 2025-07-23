namespace MLModelBuilderAPIs.DTOs;

public class PublishMLModelVersionDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the machine learning model version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the model version is a Publish template.
    /// </summary>
    public bool IsPublishTemplate { get; set; }

    /// <summary>
    /// Gets or sets the access type, which defines the user's access level within the flow.
    /// </summary>
    public AccessTypesEnum? AccessType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the space that the model version belongs to.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the machine learning model version.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();
}