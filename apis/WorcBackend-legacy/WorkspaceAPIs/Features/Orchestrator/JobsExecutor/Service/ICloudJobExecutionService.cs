namespace WorkspaceAPIs.Services;

/// <summary>
/// Executes cloud-location jobs in-process instead of dispatching them to a runner machine.
/// </summary>
public interface ICloudJobExecutionService
{
    /// <summary>
    /// Runs the job on the cloud engine, moving it to Failed when it cannot start.
    /// </summary>
    Task ExecuteAsync(Job job);
}
