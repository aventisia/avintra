namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a comment on a flow.
/// </summary>
[Table("FlowComment")]
public class FlowComment : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the FlowComment record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the tenant record for global filter (multi-tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the comment text which could be plain text or rich text or HTML. Max length is 500 characters.
    /// </summary>
    [MaxLength(500)]
    public required string Comment { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the comment has been edited.
    /// </summary>
    public bool IsEdited { get; set; } = false;

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether the comment is disabled.
    /// </summary>
    /// <remarks>
    /// It is only being used to filter the comments at the retrieval time. Only an admin should 
    /// be able to disable the comment from the admin panel if it is not appropriate.
    /// </remarks>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the ID of the user who posted the comment.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user who posted the comment.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow this comment is associated with.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the flow this comment is associated with.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }

    /// <summary>
    /// Gets or sets the version-stamping table row. Row versioning helps detect conflicts between concurrent transactions.
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}