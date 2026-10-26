namespace WorkspaceAPIs.Entities;

/// <summary>
/// Entity to store file attachments uploaded against a support ticket.
/// </summary>
[Table("support_TicketAttachments")]
public class TicketAttachment : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the TicketAttachment record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the tenant associated with the ticket attachment.
    /// </summary>
    [RequiredGuid]
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the original file name. Max length: 255.
    /// </summary>
    [MaxLength(255)]
    public required string FileName { get; set; }

    /// <summary>
    /// Gets or sets the blob storage path where the file is stored. Max length: 1000.
    /// </summary>
    [MaxLength(1000)]
    public required string FilePath { get; set; }

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// Gets or sets the file extension without the leading dot. Max length: 50.
    /// </summary>
    [MaxLength(50)]
    public string? Extension { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who uploaded the file.
    /// </summary>
    [RequiredGuid]
    public Guid UploadedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the file was uploaded.
    /// </summary>
    public DateTimeOffset UploadedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the ticket the attachment belongs to.
    /// </summary>
    [RequiredGuid]
    public required Guid TicketId { get; set; }

    /// <summary>
    /// Gets or sets the ticket associated with this attachment.
    /// </summary>
    [ForeignKey("TicketId")]
    public virtual Ticket? Ticket { get; set; }
}
