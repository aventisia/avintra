namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing and executing jobs.
/// This interface provides a contract for executing job commands asynchronously.
/// </summary>
public interface IJobsExecutorService
{
    /// <summary>
    /// Executes a command for a given job asynchronously.
    /// This method is responsible for initiating the job execution process, validating the job details,
    /// and triggering the execution of the job based on its current status.
    /// </summary>
    /// <param name="job">The job to be executed. This object contains the job details, including the job ID and the machine to execute on.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ExecuteJobCommandAsync(Job job);

    /// <summary>
    /// Triggers the execution of a job on a specific machine asynchronously.
    /// This method is responsible for sending an execution command to a client machine to perform the job.
    /// It will update the machine's status and ensure the machine is in a valid state to run the job.
    /// </summary>
    /// <param name="executionCommandDto">The details of the command to be executed. This includes the job ID, machine ID, and command type (e.g., execute, pause, etc.).</param>
    /// <returns>True when the command was sent to the machine or no hub dispatch is required; false when dispatch was blocked before the command was sent.</returns>
    Task<bool> TriggerExecutionAsync(ExecutionCommandDto executionCommandDto);

    /// <summary>
    /// Executes commands for multiple jobs by their IDs asynchronously.
    /// This method is responsible for retrieving the jobs based on the provided IDs, 
    /// validating each job's details, and triggering the execution for all valid jobs.
    /// </summary>
    /// <param name="jobIds">A list of job IDs that should be executed. The method will fetch and execute commands for each job asynchronously.</param>
    /// <returns>A task representing the asynchronous operation. The task completes when all valid jobs have been processed and execution commands have been triggered.</returns>
    Task ExecuteCommandByIdsAsync(List<Guid> jobIds);

    /// <summary>
    /// Sends a command to the connected machine to terminate the specified stuck job.
    /// </summary>
    /// <param name="job">The job that should be terminated.</param>
    /// <returns> A task that represents the asynchronous operation. </returns>
    Task KillStuckJobAsync(Job? job);
}
