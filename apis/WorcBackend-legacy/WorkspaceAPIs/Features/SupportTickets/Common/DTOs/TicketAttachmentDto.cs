namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Attachment record used for create and retrieval on a ticket.
/// Server-assigned fields (Id, UploadedByUserId, UploadedOn) are set on creation.
/// </summary>
public class TicketAttachmentDto
{
    /// <summary>Unique identifier of the attachment.</summary>
    public Guid Id { get; set; }

    /// <summary>The ticket this attachment belongs to.</summary>
    [RequiredGuid]
    public Guid TicketId { get; set; }

    /// <summary>Original file name. Max length: 255.</summary>
    [StringLength(255)]
    public required string FileName { get; set; }

    /// <summary>Blob storage path where the file is stored. Max length: 1000.</summary>
    [StringLength(1000)]
    public required string FilePath { get; set; }

    /// <summary>File size in bytes.</summary>
    public long FileSize { get; set; }

    /// <summary>File extension without the leading dot. Max length: 50.</summary>
    [StringLength(50)]
    public string? Extension { get; set; }

    /// <summary>The user who uploaded the file. Assigned server-side on creation.</summary>
    public Guid? UploadedByUserId { get; set; }

    /// <summary>When the file was uploaded.</summary>
    public DateTimeOffset UploadedOn { get; set; }
}
