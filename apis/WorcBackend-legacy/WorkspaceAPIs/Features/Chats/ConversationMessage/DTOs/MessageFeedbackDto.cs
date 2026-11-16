namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A user's rating of one assistant reply, identified by the user turn it answers.
/// </summary>
public class MessageFeedbackDto
{
    /// <summary>
    /// Gets or sets the zero-based index of the user message the rated reply answers.
    /// </summary>
    [Range(0, int.MaxValue)]
    public int UserTurn { get; set; }

    /// <summary>
    /// Gets or sets the rating: "positive" or "negative".
    /// </summary>
    [Required]
    [AllowedValues("positive", "negative")]
    public required string Rating { get; set; }
}
