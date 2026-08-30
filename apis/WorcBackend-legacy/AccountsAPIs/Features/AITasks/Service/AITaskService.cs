namespace AccountsAPIs.Services;

public class AITaskService : IAITaskService
{
    private readonly ILogger<AITaskService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public AITaskService(
        ILogger<AITaskService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // This retrieves the user ID from the JWT claims.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Method to check if the AI task name is available
    public async Task<ServiceResponse<TrueFalseResultDto>> IsAITaskNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check AI task name availability. Please try again."
        };

        try
        {
            // Check if the provided AI task name is valid
            if (string.IsNullOrEmpty(checkAvailabilityDto.UserInput))
            {
                serviceResponse.Message = $"The name '{checkAvailabilityDto.UserInput}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Check if an AI task with the same name already exists
            var existingAITask = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a message indicating it's unavailable
            if (existingAITask != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "An AI task with the same name already exists. Please enter a unique name.";
                _logger.LogWarning("An AI task with the name '{TaskName}' already exists for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
                return serviceResponse;
            }

            // If no conflict is found, the name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI task name is available.";
            _logger.LogInformation("AI task name '{TaskName}' is available for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while checking the availability of AI task name '{TaskName}' for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
        }

        // Return the response
        return serviceResponse;
    }

    // Method to retrieve all AI tasks
    public async Task<ServiceResponse<IEnumerable<AITaskTableDto>>> GetAllAITasksAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<AITaskTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve AI tasks. Please try again later."
        };

        try
        {
            // Fetch AI tasks, ordered by created on.
            var aiTasks = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.CreatedOn)
                .ToListAsync();

            // Map the fetched data to DTO and return success response
            serviceResponse.Data = aiTasks.Adapt<IEnumerable<AITaskTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI tasks retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching AI tasks for user {UserId}.", _userId);
        }

        // Return the response
        return serviceResponse;
    }

    // Method to retrieve a specific AI task by its ID.
    public async Task<ServiceResponse<AITaskTableDto>> GetAITaskAsync(Guid aiTaskId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AITaskTableDto>
        {
            Data = null, // Initialize response data as null
            Message = "Failed to retrieve AI task. Please try again later."
        };

        try
        {
            // Fetch the AI task by its unique ID, including related user information.
            var aiTask = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.Id == aiTaskId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .FirstOrDefaultAsync();

            // Check if the task exists; if not, return a "not found" response.
            if (aiTask == null)
            {
                _logger.LogWarning("AI task with ID {AITaskId} not found.", aiTaskId);
                serviceResponse.Message = "AI task not found.";
                return serviceResponse;
            }

            // Map the fetched AI task to a DTO and return success response
            serviceResponse.Data = aiTask.Adapt<AITaskTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI task retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching AI task with ID {AITaskId}.", aiTaskId);
        }

        // Return the response
        return serviceResponse;
    }

    // Method to retrieve a specific AI task by its name.
    public async Task<ServiceResponse<AITaskTableDto>> GetAITaskByNameAsync(string aiTaskName)
    {
        // Initialize ServiceResponse with a failed response by default
        var serviceResponse = new ServiceResponse<AITaskTableDto>
        {
            Data = null,
            Message = "Failed to retrieve AI task. Please try again later."
        };

        try
        {
            // Fetch the AI task by its name, including related user info (created by and last modified by)
            var aiTask = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.Name.ToLower() == aiTaskName.ToLower())
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .FirstOrDefaultAsync();

            // If the task doesn't exist, log a warning and return a not-found response
            if (aiTask == null)
            {
                _logger.LogWarning("AI task with name {AITaskName} not found.", aiTaskName);
                serviceResponse.Message = "AI task not found.";
                return serviceResponse;
            }

            // Map the fetched AI task to a DTO
            serviceResponse.Data = aiTask.Adapt<AITaskTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI task retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching AI task with name {AITaskName}.", aiTaskName);
        }

        // Return the response (either success or failure)
        return serviceResponse;
    }

    // Method to create a new AI task
    public async Task<ServiceResponse<AITaskTableDto>> InsertAITaskAsync(AITaskTableDto aiTaskDto)
    {
        var serviceResponse = new ServiceResponse<AITaskTableDto>
        {
            Data = null,
            Message = "Failed to insert AI task. Please try again."
        };

        try
        {
            // Check if an AI task with the same name already exists to avoid duplication.
            var existingTask = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.Name.ToLower() == aiTaskDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existingTask != null)
            {
                _logger.LogWarning("Attempt to insert duplicate AI task with name {TaskName}.", aiTaskDto.Name);
                serviceResponse.Message = "An AI task with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up input data by trimming unnecessary spaces from string properties
            aiTaskDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiTaskDto);

            // Map the DTO to the entity object
            var newAITask = aiTaskDto.Adapt<AITask>();
            newAITask.CreatedByUserId = _userId;
            newAITask.LastModifiedByUserId = _userId;

            // Insert the new AI task into the repository
            await _unitOfWork.AITaskRepo.InsertAsync(newAITask);

            // Save changes to the database and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Map the saved entity back to a DTO and return success response
            serviceResponse.Data = newAITask.Adapt<AITaskTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI task inserted successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting AI task with name {TaskName}.", aiTaskDto.Name);
        }

        // Return the response 
        return serviceResponse;
    }

    // Method to update an existing AI task
    public async Task<ServiceResponse<AITaskTableDto>> UpdateAITaskAsync(AITaskTableDto aiTaskDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AITaskTableDto>
        {
            Data = null,
            Message = "Failed to update AI task. Please try again."
        };

        try
        {
            // Fetch the AI task by ID
            var existingAITask = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.Id == aiTaskDto.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (existingAITask == null)
            {
                _logger.LogWarning("AI task with ID {AITaskId} not found for update.", aiTaskDto.Id);
                serviceResponse.Message = "AI task not found.";
                return serviceResponse;
            }

            // Check if an AI task with the same name already exists to avoid duplication.
            var duplicateAITask = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w =>
                    w.Id != aiTaskDto.Id &&
                    w.Name.ToLower() == aiTaskDto.Name.ToLower()
                )
                .FirstOrDefaultAsync();

            if (duplicateAITask != null)
            {
                _logger.LogWarning("Attempt to update AI task with duplicate name {TaskName}. User {UserId} tried to update an existing task with the same name.", aiTaskDto.Name, _userId);

                // Set the response message for the conflict and return with a conflict status code
                serviceResponse.Message = "An AI task with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up input data by trimming unnecessary spaces from string properties
            aiTaskDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiTaskDto);

            // Update the existing task with the new data from the DTO
            aiTaskDto.Adapt(existingAITask);
            existingAITask.LastModifiedByUserId = _userId;
            existingAITask.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update the entity in the repository
            _unitOfWork.AITaskRepo.Update(existingAITask);

            // Save changes to the database and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Map the updated entity back to DTO and return success response
            serviceResponse.Data = existingAITask.Adapt<AITaskTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI task updated successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating AI task with ID {AITaskId}.", aiTaskDto.Id);
        }

        // Return the response to the caller
        return serviceResponse;
    }

    // Method to delete an AI task by its ID
    public async Task<ServiceResponse<bool>> DeleteAITaskAsync(Guid aiTaskId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete AI task. Please try again."
        };

        try
        {
            // Fetch the AI task by ID
            var existingAITask = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.Id == aiTaskId)
                .FirstOrDefaultAsync();

            if (existingAITask == null)
            {
                _logger.LogWarning("AI task with ID {AITaskId} not found for deletion.", aiTaskId);
                serviceResponse.Message = "AI task not found.";
                return serviceResponse;
            }

            // Delete the task from the repository
            _unitOfWork.AITaskRepo.Delete(existingAITask);

            // Save changes to the database and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI task deleted successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting AI task with ID {AITaskId}.", aiTaskId);
        }

        // Return the response to the caller
        return serviceResponse;
    }

    // Deletes multiple AI tasks based on a list of unique identifiers
    public async Task<ServiceResponse<bool>> DeleteMultipleAITasksAsync(IEnumerable<Guid> aiTaskIds)
    {
        // Initialize default response with failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tasks. Please try again."
        };

        try
        {
            // Fetch the AI tasks to be deleted
            var tasksToDelete = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => aiTaskIds.Contains(w.Id))
                .AsNoTracking()
                .ToListAsync();

            // If no tasks are found for deletion, return a not found message
            if (tasksToDelete == null || !tasksToDelete.Any())
            {
                _logger.LogWarning("No AI tasks found for deletion for user {UserId} with task IDs {AITaskIds}.", _userId, string.Join(", ", aiTaskIds));
                serviceResponse.Message = "No AI tasks found for deletion.";
                return serviceResponse;
            }

            // Delete the tasks
            _unitOfWork.AITaskRepo.Delete(tasksToDelete);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete tasks for user {UserId} with task IDs {AITaskIds}. SaveChanges failed.", _userId, string.Join(", ", aiTaskIds));
                return serviceResponse;
            }

            // Set the success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully deleted {tasksToDelete.Count} AI tasks.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple AI tasks for user {UserId} with task IDs {AITaskIds}.", _userId, string.Join(", ", aiTaskIds));
        }
        // Return the response
        return serviceResponse;
    }
    // Method to search AI tasks by name
    public async Task<ServiceResponse<IEnumerable<AITaskTableDto>>> SearchAITasksByNameAsync(string taskName)
    {
        // Initialize the ServiceResponse with a failure message by default
        var serviceResponse = new ServiceResponse<IEnumerable<AITaskTableDto>>
        {
            Data = null,
            Message = "Failed to search AI tasks. Please try again."
        };

        try
        {
            // Validate that the provided task name is not null, empty, or just whitespace
            if (string.IsNullOrWhiteSpace(taskName))
            {
                serviceResponse.Message = "Search keyword cannot be empty or whitespace.";
                return serviceResponse;
            }

            // Perform the search query by matching the task name (case-insensitive)
            var matchedAITasks = await _unitOfWork.AITaskRepo
                .GetByConditionAsync(w => w.Name.ToLower().Contains(taskName.Trim().ToLower()))
                .ToListAsync();

            // If no matching AI tasks were found, return a message indicating this
            if (matchedAITasks == null || !matchedAITasks.Any())
            {
                serviceResponse.Message = "No AI tasks found matching the provided search term.";
                return serviceResponse;
            }

            // Map the matched tasks to the appropriate DTO for returning
            serviceResponse.Data = matchedAITasks.Adapt<IEnumerable<AITaskTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{matchedAITasks.Count} AI task(s) found matching the search term '{taskName}'.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while searching for AI tasks with the search term '{TaskName}' for user {UserId}.", taskName, _userId);
        }

        // Return the service response,
        return serviceResponse;
    }
}