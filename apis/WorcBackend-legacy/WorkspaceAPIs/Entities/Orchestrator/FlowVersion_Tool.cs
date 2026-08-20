namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents the association between a flow version and a tool, including optional configuration overrides.
/// </summary>
[Table("FlowVersion_Tool")]
public class FlowVersion_Tool : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier of the association.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant identifier.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated flow version.
    /// </summary>
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the associated flow version.
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated tool.
    /// </summary>
    public required Guid ToolId { get; set; }

    /// <summary>
    /// Gets or sets the associated tool.
    /// </summary>
    [ForeignKey("ToolId")]
    public virtual Tool? Tool { get; set; }

    /// <summary>
    /// Gets or sets the list of operations that are allowed for the associated tool.
    /// If <c>null</c>, all operations may be available.
    /// </summary>
    public List<string>? AllowedOperations { get; set; }

    /// <summary>
    /// Gets or sets the unique name of the credential used by this tool association.
    /// </summary>
    [MaxLength(255)]
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created the association.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the association was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;
}