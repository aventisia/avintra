namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing jobs.
/// </summary>
public interface IJobTableService
{
    /// <summary>
    /// Retrieves a list of all jobs between optional start and end date filters.
    /// </summary>
    /// <param name="startDate">The optional start date filter.</param>
    /// <param name="endDate">The optional end date filter.</param>
    /// <returns>A task representing the service response with the job details.</returns>
    Task<ServiceResponse<IEnumerable<JobTableDto>>> GetJobsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate);

    /// <summary>
    /// Retrieves a list of all job logs between optional start and end date filters.
    /// </summary>
    /// <param name="startDate">The optional start date filter.</param>
    /// <param name="endDate">The optional end date filter.</param>
    /// <returns>A task representing the service response with the job log details.</returns>
    Task<ServiceResponse<IEnumerable<JobExecutionLogDto>>> GetJobLogsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate);

    /// <summary>
    /// Fetches a job by its unique identifier.
    /// </summary>
    /// <param name="jobId">The identifier of the job to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the job.</returns>
    Task<ServiceResponse<JobExecutionLogDto>> GetJobByIdAsync(Guid jobId);

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
    /// <param name="jobExecutionLogDto">The data required to update the job.</param>
    /// <returns>A task representing the service response containing the updated job details.</returns>
    Task<ServiceResponse<JobTableDto>> UpdateJobAsync(JobExecutionLogDto jobExecutionLogDto);

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

    /// <summary>
    /// Terminates the execution of a job on a machine, based on the provided job ID, operating system ID or flow version ID.
    /// </summary>
    /// <param name="jobExecutionDto">The details of the job execution, including the OS ID and flow version ID.</param>
    /// <returns>A service response that indicates whether the job abortion was successful or not.</returns>
    Task<ServiceResponse<bool>> AbortJobExecutionAsync(JobExecutionDto jobExecutionDto);

    /// <summary>
    /// Exports job data as a CSV file based on the filters specified in the provided request DTO.
    /// </summary>
    /// <param name="exportJobRequestDto">The DTO containing optional filters such as job priority, status, agent IDs, machine IDs, and date range to filter the job data.</param>
    /// <returns>A service response containing the CSV file stream of the filtered job data.</returns>
    Task<ServiceResponse<FileStreamResult>> ExportJobsAsync(ExportJobRequestDto exportJobRequestDto);
}