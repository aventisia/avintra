namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Comment record used for create, update and retrieval on a ticket.
/// Server-assigned fields (Id, UserId, timestamps) are set on creation.
/// </summary>
public class TicketCommentDto
{
    /// <summary>Unique identifier of the comment.</summary>
    public Guid Id { get; set; }

    /// <summary>The ticket this comment belongs to.</summary>
    [RequiredGuid]
    public Guid TicketId { get; set; }

    /// <summary>Comment text. Max length: 500.</summary>
    [StringLength(500, MinimumLength = 1)]
    public required string Message { get; set; }

    /// <summary>The author of the comment. Assigned server-side on creation.</summary>
    public Guid? UserId { get; set; }

    /// <summary>Full name of the author.</summary>
    public string? UserFullName { get; set; }

    /// <summary>User name (email) of the author.</summary>
    public string? UserName { get; set; }

    /// <summary>Avatar URL of the author.</summary>
    public string? AvatarSrc { get; set; }

    /// <summary>Initials used as avatar fallback.</summary>
    public string? Initials { get; set; }

    /// <summary>True when the comment has been edited.</summary>
    public bool? IsEdited { get; set; }

    /// <summary>True when the comment is disabled.</summary>
    public bool? IsDisabled { get; set; }

    /// <summary>When the comment was created.</summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>When the comment was last modified.</summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
