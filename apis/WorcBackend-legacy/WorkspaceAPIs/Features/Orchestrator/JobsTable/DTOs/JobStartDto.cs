namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to start a job, transitioning it from Created to Running.
/// </summary>
public class JobStartDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the job.
    /// </summary>
    public Guid Id { get; set; }
}
