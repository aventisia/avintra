namespace WorkspaceAPIs.Entities;

/// <summary>
/// Entity to store individual remarks (comments) within a support ticket conversation.
/// </summary>

[Table("SupportTicketRemark")]
public class SupportTicketRemark : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the SupportTicketRemark record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the tenant associated with the support ticket remark.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the message of the support ticket remark.
    /// </summary>
    [MaxLength(500)]
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the remark has been edited.
    /// </summary>
    public bool IsEdited { get; set; } = false;

    /// <summary>
    /// Gets or sets the date and time when the SupportTicketRemark was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when the SupportTicketRemark was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

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
    /// Gets or sets a value indicating whether the remark is disabled.
    /// </summary>
    /// <remarks>
    /// It is only being used to filter the remark at the retrieval time. Only an admin should 
    /// be able to disable the remark from the admin panel if it is not appropriate.
    /// </remarks>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the ID of the support ticket.
    /// </summary>
    public required Guid SupportTicketId { get; set; }

    /// <summary>
    /// Gets or sets the support ticket associated with this remark.
    /// </summary>
    [ForeignKey("SupportTicketId")]
    public virtual SupportTicket? SupportTicket { get; set; }

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