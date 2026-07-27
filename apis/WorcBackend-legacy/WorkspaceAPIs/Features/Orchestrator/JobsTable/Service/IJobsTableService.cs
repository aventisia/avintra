namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing jobs.
/// </summary>
public interface IJobsTableService
{
    /// <summary>
    /// Retrieves a list of all jobs between optional start and end date filters.
    /// </summary>
    /// <param name="startDate">The optional start date filter.</param>
    /// <param name="endDate">The optional end date filter.</param>
    /// <returns>A task representing the service response with the job details.</returns>
    Task<ServiceResponse<IEnumerable<JobsTableRowDto>>> GetJobsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate);

    /// <summary>
    /// Get job by its ID.
    /// </summary>
    /// <param name="jobId">The identifier of the job to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the job.</returns>
    Task<ServiceResponse<JobRecordDto>> GetJobAsync(Guid jobId);

    /// <summary>
    /// Inserts a new job.
    /// </summary>
    /// <param name="jobInsertDto">The data needed to create the new job.</param>
    /// <param name="providedTenantId">Optional tenant ID to associate with the job. If not provided, the current tenant's ID will be used.</param>
    /// <returns>A task representing the service response containing the details of the newly created job.</returns>
    Task<ServiceResponse<JobRecordDto>> InsertJobAsync(JobInsertDto jobInsertDto, Guid? providedTenantId = null);

    /// <summary>
    /// Updates an existing job.
    /// </summary>
    /// <param name="jobUpdateDto">The data required to update the job.</param>
    /// <returns>A task representing the service response containing the updated job details.</returns>
    Task<ServiceResponse<JobRecordDto>> UpdateJobAsync(JobUpdateDto jobUpdateDto);

    /// <summary>
    /// Deletes a job by its ID.
    /// </summary>
    /// <param name="jobId">The identifier of the job to be deleted.</param>
    /// <returns>A task representing the service response indicating whether the job was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteJobAsync(Guid jobId);

    /// <summary>
    /// Deletes multiple jobs by their IDs.
    /// </summary>
    /// <param name="jobIds">The list of identifiers of the jobs to delete.</param>
    /// <returns>A task representing the service response indicating whether the jobs were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple jobs at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteJobsAsync(IEnumerable<Guid> jobIds);

    /// <summary>
    /// Exports jobs data into a CSV file
    /// </summary>
    /// <param name="exportJobsReqDto">DTO for exporting jobs data request. This DTO contains optional filters such as list of job priorities, list of job statuses etc. to filter the job data.</param>
    /// <returns>A service response containing the CSV file stream of the filtered job data.</returns>
    Task<ServiceResponse<FileStreamResult>> ExportJobsAsync(ExportJobsReqDto exportJobsReqDto);

    // TODO: Need to check this
    // /// <summary>
    // /// Retrieves a list of all job logs between optional start and end date filters.
    // /// </summary>
    // /// <param name="startDate">The optional start date filter.</param>
    // /// <param name="endDate">The optional end date filter.</param>
    // /// <returns>A task representing the service response with the job log details.</returns>
    // Task<ServiceResponse<IEnumerable<JobTableDto>>> GetJobLogsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate);

    // /// <summary>
    // /// Retries a failed job.
    // /// </summary>
    // /// <param name="jobId">The identifier of the job to retry.</param>
    // /// <returns>A task representing the service response indicating whether the job retry was successful.</returns>
    // Task<ServiceResponse<bool>> RetryJobAsync(Guid jobId);

    // /// <summary>
    // /// Cancels a running job.
    // /// </summary>
    // /// <param name="jobId">The identifier of the job to cancel.</param>
    // /// <returns>A task representing the service response indicating whether the job cancellation was successful.</returns>
    // Task<ServiceResponse<bool>> CancelJobAsync(Guid jobId);

    // /// <summary>
    // /// Terminates the execution of a running job using its identifier.
    // /// </summary>
    // /// <param name="jobAbortRequestDto">The job abort request payload.</param>
    // /// <returns>A service response that indicates whether the job abortion was successful or not.</returns>
    // Task<ServiceResponse<bool>> AbortJobExecutionAsync(JobAbortRequestDto jobAbortRequestDto);

    // /// <summary>
    // /// Exports job data as a CSV file based on the filters specified in the provided request DTO.
    // /// </summary>
    // /// <param name="exportJobRequestDto">The DTO containing optional filters such as job priority, status, agent IDs, machine IDs, and date range to filter the job data.</param>
    // /// <returns>A service response containing the CSV file stream of the filtered job data.</returns>
    // Task<ServiceResponse<FileStreamResult>> ExportJobsAsync(ExportJobRequestDto exportJobRequestDto);
}