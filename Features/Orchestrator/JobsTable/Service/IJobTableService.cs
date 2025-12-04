namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing jobs.
/// </summary>
public interface IJobTableService
{
    /// <summary>
    /// Fetches all jobs associated with the current user.
    /// </summary>
    /// <returns>A task representing the service response containing a list of job details.</returns>
    Task<ServiceResponse<IEnumerable<JobTableDto>>> GetJobsAsync();

    /// <summary>
    /// Fetches a job by its unique identifier.
    /// </summary>
    /// <param name="jobId">The identifier of the job to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the job.</returns>
    Task<ServiceResponse<JobTableDto>> GetJobByIdAsync(Guid jobId);

    /// <summary>
    /// Fetches a job detail by its unique identifier.
    /// </summary>
    /// <param name="jobId">The identifier of the job to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the job.</returns>
    Task<ServiceResponse<JobDetailDto>> GetJobDetailByIdAsync(Guid jobId);

    /// <summary>
    /// Creates a new job with the provided data.
    /// </summary>
    /// <param name="jobTableDto">The data needed to create the new job.</param>
    /// <returns>A task representing the service response containing the details of the newly created job.</returns>
    Task<ServiceResponse<JobTableDto>> InsertJobAsync(JobTableDto jobTableDto);

    /// <summary>
    /// Modifies an existing job with the provided data.
    /// </summary>
    /// <param name="jobTableDto">The data required to update the job.</param>
    /// <returns>A task representing the service response containing the updated job details.</returns>
    Task<ServiceResponse<JobTableDto>> UpdateJobAsync(JobTableDto jobTableDto);

    /// <summary>
    /// Removes a job by its identifier.
    /// </summary>
    /// <param name="jobId">The identifier of the job to be deleted.</param>
    /// <returns>A task representing the service response indicating whether the job was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteJobAsync(Guid jobId);

    /// <summary>
    /// Removes multiple jobs by their identifiers.
    /// </summary>
    /// <param name="jobIds">The list of identifiers of the jobs to delete.</param>
    /// <returns>A task representing the service response indicating whether the jobs were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple jobs at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteJobsAsync(IEnumerable<Guid> jobIds);

    /// <summary>
    /// Retries a failed job.
    /// </summary>
    /// <param name="jobId">The identifier of the job to retry.</param>
    /// <returns>A task representing the service response indicating whether the job retry was successful.</returns>
    Task<ServiceResponse<bool>> RetryJobAsync(Guid jobId);

    /// <summary>
    /// Cancels a running job.
    /// </summary>
    /// <param name="jobId">The identifier of the job to cancel.</param>
    /// <returns>A task representing the service response indicating whether the job cancellation was successful.</returns>
    Task<ServiceResponse<bool>> CancelJobAsync(Guid jobId);
}
