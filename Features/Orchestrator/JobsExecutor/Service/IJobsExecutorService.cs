namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing and executing jobs.
/// This interface provides a contract for executing job commands asynchronously.
/// </summary>
public interface IJobsExecutorService
{
    /// <summary>
    /// Executes a command for a given job asynchronously.
    /// </summary>
    /// <param name="job">The job to be executed.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ExecuteJobCommandAsync(Job job);
}
