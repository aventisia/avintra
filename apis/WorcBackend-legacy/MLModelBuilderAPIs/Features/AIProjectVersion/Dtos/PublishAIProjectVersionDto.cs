namespace MLModelBuilderAPIs.DTOs;

public class PublishAIProjectVersionDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the machine learning model version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the access type, which defines the user's access level within the flow.
    /// </summary>
    public AccessTypesEnum? AccessType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the space that the model version belongs to.
    /// </summary>
    public Guid? SpaceId { get; set; }
}