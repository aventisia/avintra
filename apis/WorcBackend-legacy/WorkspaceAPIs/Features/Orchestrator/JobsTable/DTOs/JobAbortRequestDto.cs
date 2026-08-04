namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to abort a running job.
/// </summary>
public class JobAbortRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the job.
    /// </summary>
    public Guid Id { get; set; }
}
