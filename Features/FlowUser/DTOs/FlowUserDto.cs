namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a user associated with a flow.
/// </summary>
public class FlowUserDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the FlowUser record.
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Gets or sets the access type of the user within the flow.
    /// </summary>
    public AgentAccessTypesEnum Type { get; set; }
    
    /// <summary>
    /// Gets or sets the identifier of the flow that the user is linked to.
    /// </summary>
    [RequiredGuid]
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user associated with the flow.
    /// </summary>
    public string? UserFullName { get; set; }

    /// <summary>
    /// Gets or sets the username (unique identifier) of the user.
    /// </summary>
    public string? UserName { get; set; }

    /// <summary>
    /// Gets or sets the URL of the user's avatar image, if available.
    /// </summary>
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Gets or sets the initials of the user.
    /// </summary>
    public string? Initials { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the user was added to the flow.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }
}
