namespace WorkspaceAPIs.DTOs;

public class PublishFlowVersionDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the flow version record.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the optional identifier of the flow.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the name of the block pr template.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the block pr template.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the optional thumbnail image reference for the flow.
    /// </summary>
    [StringLength(255)]
    public string? Thumbnail { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity being published (e.g., Agent, Block).
    /// </summary>
    public PublishTypesEnum Type { get; set; }
}
