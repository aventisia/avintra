namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a user associated with an ML model.
/// </summary>
public class AssignMLModelUserDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the MLModelUser record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the access type of the user within the ML model.
    /// </summary>
    public required AgentAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the ML model that the user is linked to.
    /// </summary>
    [RequiredGuid]
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets list of user IDs to be associated with the specified ML model.
    /// </summary>
    public required List<Guid> UserIds { get; set; }
}
