namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for making a request to terminate a user's session(s).
/// </summary>
public class TerminateSessionDto
{
    /// <summary>
    /// Gets or sets the reason for session termination.
    /// </summary>
    public required TerminateSessionReasonsEnum HowSessionEnded { get; set; }

    /// <summary>
    /// Gets or sets the list of session IDs that need to be terminated.
    /// </summary>
    [MinLength(1)]
    public required List<Guid> SessionIdList { get; set; }
}