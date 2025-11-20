namespace WorkspaceAPIs.Services;

public class JobTableService : IJobTableService
{
    private readonly ILogger<JobTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public JobTableService(
        ILogger<JobTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of jobs associated with the current user.
    public async Task<ServiceResponse<IEnumerable<JobTableDto>>> GetJobsAsync()
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<IEnumerable<JobTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve jobs. Please try again."
        };

        try
        {

            // Fetch jobs created by the current user
            var jobs = await _unitOfWork.JobRepo
                                        .GetAllAsync()
                                        .Include(i => i.FlowVersion)
                                            .ThenInclude(i2 => i2.Flow)
                                        .OrderByDescending(o => o.CreatedOn)
                                        .ProjectToType<JobTableDto>()
                                        .ToListAsync();


            // Success - set the response with retrieved jobs
            serviceResponse.Data = jobs;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Jobs retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a specific job by its ID for the current user.
    public async Task<ServiceResponse<JobTableDto>> GetJobByIdAsync(Guid jobId)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<JobTableDto>
        {
            Data = null,
            Message = "Failed to retrieve the job. Please try again."
        };

        try
        {
            // Fetch a specific job created by the current user
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobId
                                        )
                                        .OrderByDescending(w => w.CreatedOn)
                                        .ProjectToType<JobTableDto>()
                                        .FirstOrDefaultAsync();

            // Success - set the response with retrieved job
            serviceResponse.Data = job;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Adds a new job.
    public async Task<ServiceResponse<JobTableDto>> InsertJobAsync(JobTableDto jobTableDto)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<JobTableDto>
        {
            Data = null,
            Message = "Failed to add the job. Please try again."
        };

        try
        {
            // TODO: Uncomment this code if we need to check and enforce uniqueness for jobs created by the current user with the same flow version ID to prevent duplicate job entries in the system.            // // Check if a job with the same name already exists
            // var jobAlreadyExists = await _unitOfWork.JobRepo
            //                                         .GetByConditionAsync(w =>
            //                                             w.CreatedByUserId == _userId && 
            //                                             w.FlowVersionId == jobTableDto.FlowVersionId
            //                                         )
            //                                         .FirstOrDefaultAsync();

            // // If a job exists, return conflict status
            // if (jobAlreadyExists != null)
            // {
            //     _logger.LogInformation("Job already exists.");
            //     serviceResponse.StatusCode = 409;
            //     serviceResponse.Message = "A job with the same name already exists. Please provide a unique name.";
            //     return serviceResponse;
            // }

            // Trim the string properties in the DTO
            jobTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobTableDto);

            // Map DTO to Job entity
            var newJob = jobTableDto.Adapt<Job>();

            // Insert the new job into the repository
            await _unitOfWork.JobRepo.InsertAsync(newJob);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new job.");
                return serviceResponse;
            }

            // Success - return the created job
            serviceResponse.Data = newJob.Adapt<JobTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing job.
    public async Task<ServiceResponse<JobTableDto>> UpdateJobAsync(JobTableDto jobTableDto)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<JobTableDto>
        {
            Data = null,
            Message = "Failed to update the job. Please try again."
        };

        try
        {
            // Ensure the job status can only be updated to 'Completed' or 'Failed'
            if (jobTableDto.Status != JobStatusTypesEnum.Completed && jobTableDto.Status != JobStatusTypesEnum.Failed)
            {
                // If the current status is not 'Completed' or 'Failed', reject the update
                _logger.LogInformation($"Job with ID {jobTableDto.Id} cannot be updated because its status must be either 'Completed' or 'Failed'. Current status: {jobTableDto.Status}.");
                serviceResponse.Message = "Job can only be updated to 'Completed' or 'Failed'.";
                return serviceResponse;
            }

            // Fetch the job that needs to be updated
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobTableDto.Id &&
                                            w.FlowVersionId == jobTableDto.FlowVersionId
                                        )
                                        .SingleOrDefaultAsync();

            // If the job does not exist, return error message
            if (job == null)
            {
                _logger.LogInformation("Job does not exist.");
                serviceResponse.Message = "Job does not exist.";
                return serviceResponse;
            }

            // TODO: Uncomment this code if we need to check and enforce uniqueness for jobs created by the current user with the same flow version ID to prevent duplicate job entries in the system.
            // // Check if another job with the same name exists
            // var jobAlreadyExists = await _unitOfWork.JobRepo
            //                                          .GetByConditionAsync(w =>
            //                                             w.CreatedByUserId == _userId &&
            //                                             w.Id != jobTableDto.Id)
            //                                          .FirstOrDefaultAsync();

            // // If the job with the same name exists, return conflict status
            // if (jobAlreadyExists != null)
            // {
            //     _logger.LogInformation("Job with the same name already exists.");
            //     serviceResponse.StatusCode = 409;
            //     serviceResponse.Message = "A job with the same name already exists. Please provide a unique name.";
            //     return serviceResponse;
            // }

            // Trim the string properties in the DTO
            jobTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobTableDto);

            // Map the updated values from DTO to the job entity
            jobTableDto.Adapt(job);

            // Update the job in the repository
            _unitOfWork.JobRepo.Update(job);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating job.");
                return serviceResponse;
            }

            // Success - return the updated job
            serviceResponse.Data = job.Adapt<JobTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a job by its ID.
    public async Task<ServiceResponse<bool>> DeleteJobAsync(Guid jobId)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the job. Please try again."
        };

        try
        {
            // Fetch the job to be deleted
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobId)
                                        .SingleOrDefaultAsync();

            // If the job does not exist, return error message
            if (job == null)
            {
                _logger.LogInformation("Job does not exist.");
                serviceResponse.Message = "Job does not exist.";
                return serviceResponse;
            }

            // Delete the job from the repository
            _unitOfWork.JobRepo.Delete(job);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting job.");
                return serviceResponse;
            }

            // Success - return confirmation
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple jobs by their IDs.
    public async Task<ServiceResponse<bool>> DeleteJobsAsync(IEnumerable<Guid> jobIds)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the jobs. Please try again."
        };

        try
        {
            // Fetch the jobs to be deleted
            var jobs = await _unitOfWork.JobRepo
                                            .GetByConditionAsync(w =>
                                                jobIds.Contains(w.Id))
                                            .ToListAsync();

            // If no jobs found, return error message
            if (jobs.Count == 0)
            {
                _logger.LogInformation("Jobs do not exist.");
                serviceResponse.Message = "Jobs do not exist.";
                return serviceResponse;
            }

            // Delete the jobs from the repository
            _unitOfWork.JobRepo.Delete(jobs);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting jobs.");
                return serviceResponse;
            }

            // Success - return confirmation with the count of deleted jobs
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{jobIds.Count()} jobs deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retries a failed job.
    public async Task<ServiceResponse<bool>> RetryJobAsync(Guid jobId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to retry job. Please try again."
        };

        try
        {
            // Retrieve the job to retry
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobId)
                                        .SingleOrDefaultAsync();

            // Job does not exist
            if (job == null)
            {
                _logger.LogInformation($"Job with ID {jobId} does not exist or is not owned by the current user.");
                serviceResponse.Message = "Job does not exist or cannot be retried.";
                return serviceResponse;
            }

            // // Check if job is already running or completed
            if (job.Status != JobStatusTypesEnum.Failed)
            {
                _logger.LogInformation($"Job with ID {jobId} cannot be retried because it is not in a failed state.");
                serviceResponse.Message = "Job cannot be retried because it is not in a failed state.";
                return serviceResponse;
            }

            // Reset the job status and set other necessary properties for retry
            job.Status = JobStatusTypesEnum.Running;
            job.RetryCount++;

            // Update job in the repository
            _unitOfWork.JobRepo.Update(job);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save changes while retrying job with ID {jobId}.");
                return serviceResponse;
            }

            // Successfully retried the job
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job retried successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Cancels a running job.
    public async Task<ServiceResponse<bool>> CancelJobAsync(Guid jobId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to cancel job. Please try again."
        };

        try
        {
            // Retrieve the job to cancel
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w => w.Id == jobId)
                                        .SingleOrDefaultAsync();

            // Job does not exist
            if (job == null)
            {
                _logger.LogInformation($"Job with ID {jobId} does not exist or is not owned by the current user.");
                serviceResponse.Message = "Job does not exist or cannot be canceled.";
                return serviceResponse;
            }

            // Check if job is already completed or canceled
            if (job.Status == JobStatusTypesEnum.Completed || job.Status == JobStatusTypesEnum.Canceled)
            {
                _logger.LogInformation($"Job with ID {jobId} cannot be canceled because it is already completed or canceled.");
                serviceResponse.Message = "Job cannot be canceled because it is already completed or canceled.";
                return serviceResponse;
            }

            // Set job status to canceled
            job.Status = JobStatusTypesEnum.Canceled;

            // Update job in the repository
            _unitOfWork.JobRepo.Update(job);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save changes while canceling job with ID {jobId}.");
                return serviceResponse;
            }

            // Successfully canceled the job
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job canceled successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}
