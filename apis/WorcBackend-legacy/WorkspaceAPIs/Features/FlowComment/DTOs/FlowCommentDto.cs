namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a flow comment.
/// </summary>
public class FlowCommentDto
{
    /// <summary>
    /// Gets or sets the record's primary key in Guid (globally unique identifier) format.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow this comment is associated with.
    /// </summary>
    [RequiredGuid]
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the flow comment which could be plain text or rich text or html. Max-500.
    /// </summary>
    [StringLength(500, MinimumLength = 1)]
    public required string Comment { get; set; }

    /// <summary>
    /// Gets or sets the user's full name who posted the comment.
    /// </summary>
    public string? UserFullName { get; set; }

    /// <summary>
    /// Gets or sets the username (A unique identifier) of the user who posted the comment.
    /// </summary>
    public string? UserName { get; set; }

    /// <summary>
    /// Gets or sets the user's avatar image URL (if available) of the user who posted the comment.
    /// </summary>
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Gets or sets the user's initials of the user who posted the comment.
    /// </summary>
    public string? Initials { get; set; }

    /// <summary>
    /// Gets or sets when the comment was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the comment has been edited.
    /// </summary>
    public bool? IsEdited { get; set; }
}