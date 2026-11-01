namespace GlobalAdminAPIs.Services;

public class OnPremInstanceService : IOnPremInstanceService
{
    private readonly ILogger<OnPremInstanceService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _username;

    // Constructor: Initializes the service with logger, unit of work, and username from JWT claims
    public OnPremInstanceService(
        ILogger<OnPremInstanceService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Retrieve the username from the JWT claims for associating operations with a specific user
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;
    }

    // Checks if the OnPremInstance name is available for the specified tenant
    public async Task<ServiceResponse<TrueFalseResultDto>> IsOnPremInstanceNameAvailableAsync(Guid onPremTenantId, CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check OnPremInstance name availability. Please try again."
        };

        try
        {
            // Check if user input (tenant name) is valid (non-empty)
            if (string.IsNullOrEmpty(checkAvailabilityDto.UserInput))
            {
                // Log the invalid input and update the service response message
                _logger.LogError($"Invalid OnPremInstance name: '{checkAvailabilityDto.UserInput}'. User: {_username}");
                serviceResponse.Message = "The OnPremInstance name is invalid.";
                return serviceResponse;
            }

            // Check if an OnPremInstance with the same name already exists in the database (case-insensitive)
            var existingOnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w =>
                w.OnPremTenantId == onPremTenantId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower()
                )
                .FirstOrDefaultAsync();

            // If OnPremInstance exists, return false indicating the name is not available
            if (existingOnPremInstance != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "OnPremInstance name already exists. Please enter a different name.";
                _logger.LogWarning($"OnPremInstance name '{checkAvailabilityDto.UserInput}' already exists. User: {_username}");
                return serviceResponse;
            }

            // If no OnPremInstance exists, return true indicating the name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance name is available.";
            _logger.LogInformation($"OnPremInstance name '{checkAvailabilityDto.UserInput}' is available. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs during the operation
            _logger.LogError(ex, "Error checking availability of OnPremInstance name.");
        }

        return serviceResponse;
    }

    // Method to retrieve all the on-premises instances associated with the specified tenant.
    public async Task<ServiceResponse<IEnumerable<OnPremInstanceDto>>> GetAllOnPremInstancesAsync(Guid onPremTenantId)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<IEnumerable<OnPremInstanceDto>>
        {
            Data = null,
            Message = "Failed to retrieve OnPremInstances. Please try again."
        };

        try
        {
            // Filter and project to the DTO inside the database. The repository already
            // applies AsNoTracking, so no entity graph is tracked or hydrated in memory.
            var OnPremInstances = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.OnPremTenantId == onPremTenantId)
                .OrderByDescending(o => o.DeployedOn)
                .Select(i => new OnPremInstanceDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Type = i.Type,
                    PlatformVersion = i.PlatformVersion,
                    DeployedOn = i.DeployedOn,
                    LastValidatedOn = i.LastValidatedOn,
                    NoOfInvalidCheck = i.NoOfInvalidCheck,
                    OnPremTenantId = i.OnPremTenantId
                })
                .ToListAsync();

            // Return the projected DTOs
            serviceResponse.Data = OnPremInstances;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "The OnPremInstances retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved {OnPremInstances.Count} OnPremInstances. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the operation
            _logger.LogError(ex, "Error occurred while fetching OnPremInstances.");
        }

        return serviceResponse;
    }

    // Method to retrieve an on-premises OnPremInstance by its ID
    public async Task<ServiceResponse<OnPremInstanceDto>> GetOnPremInstanceAsync(Guid OnPremInstanceId)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremInstanceDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremInstance. Please try again."
        };

        try
        {
            // Fetch OnPremInstance by ID from the repository
            var OnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Id == OnPremInstanceId)
                .SingleOrDefaultAsync();

            // If OnPremInstance not found, return a 'not found' message
            if (OnPremInstance == null)
            {
                _logger.LogWarning($"OnPremInstance with ID {OnPremInstanceId} not found. User: {_username}");
                serviceResponse.Message = "OnPremInstance not found.";
                return serviceResponse;
            }

            // Return the OnPremInstance data mapped to a DTO
            serviceResponse.Data = OnPremInstance.Adapt<OnPremInstanceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved OnPremInstance with ID {OnPremInstanceId}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while fetching OnPremInstance.");
        }

        return serviceResponse;
    }

    // Method to retrieve an OnPremInstance by its name
    public async Task<ServiceResponse<OnPremInstanceDto>> GetOnPremInstanceByNameAsync(string OnPremInstanceName)
    {
        var serviceResponse = new ServiceResponse<OnPremInstanceDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremInstance by name. Please try again."
        };

        try
        {
            // Validate that the OnPremInstance name is not null or empty
            if (string.IsNullOrWhiteSpace(OnPremInstanceName))
            {
                serviceResponse.Message = "OnPremInstance name cannot be empty.";
                return serviceResponse;
            }

            // Retrieve OnPremInstance by name (case-insensitive comparison)
            var OnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Name.ToLower() == OnPremInstanceName.ToLower())
                .FirstOrDefaultAsync();

            // If the OnPremInstance is not found, return a 'not found' message
            if (OnPremInstance == null)
            {
                _logger.LogWarning($"OnPremInstance with name '{OnPremInstanceName}' not found. User: {_username}");
                serviceResponse.Message = "OnPremInstance not found.";
                return serviceResponse;
            }

            // Return the OnPremInstance data mapped to a DTO
            serviceResponse.Data = OnPremInstance.Adapt<OnPremInstanceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved OnPremInstance with name '{OnPremInstanceName}'. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the operation
            _logger.LogError(ex, "Error occurred while fetching OnPremInstance by name.");
        }

        return serviceResponse;
    }

    // Method to create a new on-premises OnPremInstance
    public async Task<ServiceResponse<OnPremInstanceDto>> InsertOnPremInstanceAsync(OnPremInstanceDto OnPremInstanceDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremInstanceDto>
        {
            Data = null,
            Message = "Failed to insert OnPremInstance. Please try again."
        };

        try
        {
            // Check if the OnPremInstance name already exists to avoid duplication (case-insensitive)
            var existingOnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w =>
                    w.OnPremTenantId == OnPremInstanceDto.OnPremTenantId &&
                    w.Name.ToLower() == OnPremInstanceDto.Name.ToLower()
                )
                .FirstOrDefaultAsync();

            // If OnPremInstance exists, return a conflict response
            if (existingOnPremInstance != null)
            {
                _logger.LogWarning($"Attempt to insert duplicate OnPremInstance with name {OnPremInstanceDto.Name}. User: {_username}");
                serviceResponse.Message = "An OnPremInstance with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Create and save the new OnPremInstance in the repository
            var newOnPremInstance = OnPremInstanceDto.Adapt<OnPremInstance>();
            newOnPremInstance.CreatedByUser = _username;

            // Insert the new OnPremInstance
            await _unitOfWork.OnPremInstanceRepo.InsertAsync(newOnPremInstance);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save OnPremInstance. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = newOnPremInstance.Adapt<OnPremInstanceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance inserted successfully.";
            _logger.LogInformation($"Successfully inserted new OnPremInstance with name {OnPremInstanceDto.Name}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while inserting OnPremInstance.");
        }

        return serviceResponse;
    }

    // Method to update an existing on-premises OnPremInstance
    public async Task<ServiceResponse<OnPremInstanceDto>> UpdateOnPremInstanceAsync(OnPremInstanceDto OnPremInstanceDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremInstanceDto>
        {
            Data = null,
            Message = "Failed to update OnPremInstance. Please try again."
        };

        try
        {
            // Retrieve the existing OnPremInstance by ID
            var existingOnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Id == OnPremInstanceDto.Id)
                .FirstOrDefaultAsync();

            // If OnPremInstance not found, return a 'not found' message
            if (existingOnPremInstance == null)
            {
                _logger.LogWarning($"OnPremInstance with ID {OnPremInstanceDto.Id} not found for update. User: {_username}");
                serviceResponse.Message = "OnPremInstance not found.";
                return serviceResponse;
            }

            // Check for duplicates based on the name, excluding the current OnPremInstance
            var duplicateOnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w =>
                    w.Id != OnPremInstanceDto.Id &&
                    w.Name.ToLower() == OnPremInstanceDto.Name.ToLower())
                .FirstOrDefaultAsync();

            // If a duplicate OnPremInstance is found, return a conflict response
            if (duplicateOnPremInstance != null)
            {
                _logger.LogWarning($"Duplicate OnPremInstance found with name '{OnPremInstanceDto.Name}' (excluding current one). User: {_username}");
                serviceResponse.Message = "An OnPremInstance with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Update the OnPremInstance details and save the changes
            OnPremInstanceDto.Adapt(existingOnPremInstance);

            _unitOfWork.OnPremInstanceRepo.Update(existingOnPremInstance);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save updated OnPremInstance. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = existingOnPremInstance.Adapt<OnPremInstanceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance updated successfully.";
            _logger.LogInformation($"Successfully updated OnPremInstance with ID {OnPremInstanceDto.Id}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while updating OnPremInstance.");
        }

        return serviceResponse;
    }

    // Method to delete an OnPremInstance by ID
    public async Task<ServiceResponse<bool>> DeleteOnPremInstanceAsync(Guid OnPremInstanceId)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete OnPremInstance. Please try again."
        };

        try
        {
            // Retrieve the OnPremInstance by ID
            var existingOnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Id == OnPremInstanceId)
                .FirstOrDefaultAsync();

            // If OnPremInstance not found, return a 'not found' message
            if (existingOnPremInstance == null)
            {
                _logger.LogWarning($"OnPremInstance with ID {OnPremInstanceId} not found for deletion. User: {_username}");
                serviceResponse.Message = "OnPremInstance not found.";
                return serviceResponse;
            }

            // Delete the OnPremInstance from the repository
            _unitOfWork.OnPremInstanceRepo.Delete(existingOnPremInstance);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save after deletion. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance deleted successfully.";
            _logger.LogInformation($"Successfully deleted OnPremInstance with ID {OnPremInstanceId}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while deleting OnPremInstance.");
        }

        return serviceResponse;
    }

    // Method to delete multiple OnPremInstances by IDs
    public async Task<ServiceResponse<bool>> DeleteMultipleOnPremInstancesAsync(IEnumerable<Guid> OnPremInstanceIds)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete OnPremInstances. Please try again."
        };

        try
        {
            // Retrieve the OnPremInstances by their IDs
            var OnPremInstancesToDelete = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => OnPremInstanceIds.Contains(w.Id))
                .ToListAsync();

            // If no OnPremInstances found for deletion, return an appropriate message
            if (!OnPremInstancesToDelete.Any())
            {
                _logger.LogWarning($"No OnPremInstances found for deletion with IDs: {string.Join(", ", OnPremInstanceIds)}. User: {_username}");
                serviceResponse.Message = "No OnPremInstances found for deletion.";
                return serviceResponse;
            }

            // Delete the OnPremInstances from the repository
            _unitOfWork.OnPremInstanceRepo.Delete(OnPremInstancesToDelete);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save after bulk deletion. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstances deleted successfully.";
            _logger.LogInformation($"Successfully deleted {OnPremInstancesToDelete.Count} OnPremInstances. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while deleting multiple OnPremInstances.");
        }

        return serviceResponse;
    }

    // Method to search for OnPremInstances by name
    public async Task<ServiceResponse<IEnumerable<OnPremInstanceDto>>> SearchOnPremInstancesByNameAsync(string OnPremInstanceName)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<IEnumerable<OnPremInstanceDto>>
        {
            Data = null,
            Message = "Failed to search OnPremInstances. Please try again."
        };

        try
        {
            // Validate search term is not empty
            if (string.IsNullOrWhiteSpace(OnPremInstanceName))
            {
                serviceResponse.Message = "Search term cannot be empty.";
                return serviceResponse;
            }

            // Search for OnPremInstances whose name contains the search term
            var matchedOnPremInstances = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Name.ToLower().Contains(OnPremInstanceName.Trim().ToLower()))
                .ToListAsync();

            // Return matched OnPremInstances
            serviceResponse.Data = matchedOnPremInstances.Adapt<IEnumerable<OnPremInstanceDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{matchedOnPremInstances.Count} OnPremInstance(s) found matching the search term.";
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while searching for OnPremInstances.");
        }

        return serviceResponse;
    }

    // Retrieves the statistics for a specific on-premises tenant instance by its unique identifier.
    public async Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremInstanceStatsAsync(Guid onPremInstanceId)
    {
        // Initialize the service response with default failure message and null data
        var serviceResponse = new ServiceResponse<OnpremInstanceStaticDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremInstance statistics. Please try again."
        };

        try
        {
            var statsDto = await BuildInstanceStatsAsync(onPremInstanceId);

            // If the on-premises instance is not found, return the appropriate response with a warning
            if (statsDto == null)
            {
                _logger.LogWarning($"OnPremInstance with ID {onPremInstanceId} not found. User: {_username}");
                serviceResponse.Message = "OnPremInstance not found.";
                return serviceResponse;
            }

            // Set the service response data, status, and success message
            serviceResponse.Data = statsDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance statistics retrieved successfully.";

            _logger.LogInformation($"Successfully retrieved statistics for OnPremInstance ID {onPremInstanceId}. User: {_username}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving OnPremInstance statistics by ID.");
        }

        return serviceResponse;
    }

    // Retrieves the statistics for a specific on-premises tenant instance by its name.
    public async Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremInstanceStatsByNameAsync(string tenantInstanceName)
    {
        // Initialize the service response with default failure message and null data
        var serviceResponse = new ServiceResponse<OnpremInstanceStaticDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremInstance statistics by name. Please try again."
        };

        try
        {
            // Resolve the instance id first (case-insensitive), then compute the statistics by id
            var onPremInstanceId = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Name.ToLower() == tenantInstanceName.ToLower())
                .Select(w => (Guid?)w.Id)
                .FirstOrDefaultAsync();

            // If the on-premises instance is not found, return the appropriate response with a warning
            if (onPremInstanceId == null)
            {
                _logger.LogWarning($"OnPremInstance with name '{tenantInstanceName}' not found. User: {_username}");
                serviceResponse.Message = "OnPremInstance not found.";
                return serviceResponse;
            }

            var statsDto = await BuildInstanceStatsAsync(onPremInstanceId.Value);

            // Set the service response data, status, and success message
            serviceResponse.Data = statsDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance statistics retrieved successfully.";

            // Log the success of the operation
            _logger.LogInformation($"Successfully retrieved statistics for OnPremInstance '{tenantInstanceName}'. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the process
            _logger.LogError(ex, "Error occurred while retrieving OnPremInstance statistics by name.");
        }

        return serviceResponse;
    }

    // Computes the statistics for a single instance directly in the database. Returns null when the
    // instance does not exist.
    //
    // Instead of loading every OnPremInstanceData row into memory and summing it in C#, the
    // aggregation is pushed into PostgreSQL: correlated SUM subqueries produce the totals and the
    // single most recent row (served by the (OnPremInstanceId, ValidatedOn) index) provides the
    // current user / published-agent counts.
    private async Task<OnpremInstanceStaticDto?> BuildInstanceStatsAsync(Guid onPremInstanceId)
    {
        // Verify the instance exists (cheap primary-key lookup). Checking existence separately
        // keeps the "not found" response while letting the aggregate run as a single pass over
        // the instance-data table.
        var instanceExists = await _unitOfWork.OnPremInstanceRepo
            .GetByConditionAsync(i => i.Id == onPremInstanceId)
            .AnyAsync();

        if (!instanceExists)
        {
            return null;
        }

        // Both totals are computed in a single scan. Grouping by a constant makes EF emit one
        // aggregate query instead of a separate SUM subquery per column.
        var aggregate = await _unitOfWork.OnPremInstanceDataRepo
            .GetByConditionAsync(d => d.OnPremInstanceId == onPremInstanceId)
            .GroupBy(d => 1)
            .Select(g => new
            {
                TotalExecutionTimeConsumed = g.Sum(x => x.ExecutionTime),
                TotalExecutedJobs = g.Sum(x => (long)x.ExecutedJobs)
            })
            .FirstOrDefaultAsync();

        // The latest validation row provides the current user / published-agent counts
        var latestInstanceData = await _unitOfWork.OnPremInstanceDataRepo
            .GetByConditionAsync(d => d.OnPremInstanceId == onPremInstanceId)
            .OrderByDescending(d => d.ValidatedOn)
            .Select(d => new { d.Users, d.PublishedAgents })
            .FirstOrDefaultAsync();

        return new OnpremInstanceStaticDto
        {
            TotalExecutionTimeConsumed = aggregate?.TotalExecutionTimeConsumed ?? 0d,
            TotalExecutedJobs = aggregate?.TotalExecutedJobs ?? 0L,
            TotalUsers = latestInstanceData?.Users ?? 0,
            TotalPublishedAgents = latestInstanceData?.PublishedAgents ?? 0
        };
    }
}
