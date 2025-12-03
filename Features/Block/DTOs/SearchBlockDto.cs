namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a block associated with a specific version.
/// </summary>
public class SearchBlockDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the flow version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the block.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the block.
    /// </summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the access level for the block. Possible values include: Agent Level, Tenant Level, and Public.
    /// </summary>
    public AccessTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow to which this block belongs.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the block is disabled.
    /// </summary>
    /// <remarks>
    /// Note: This property is nullable to allow differentiation between true, false, and unspecified (null) states.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the block.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the block was created.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the block.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the block was last modified.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
