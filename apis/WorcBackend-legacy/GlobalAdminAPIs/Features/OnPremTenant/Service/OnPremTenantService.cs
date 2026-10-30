namespace GlobalAdminAPIs.Services;

public class OnPremTenantService : IOnPremTenantService
{
    private readonly ILogger<OnPremTenantService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _username;

    // Constructor: Initializes the service with logger, unit of work, and username from JWT claims
    public OnPremTenantService(
        ILogger<OnPremTenantService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Retrieve the username from the JWT claims for associating operations with a specific user
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;
    }

    // Method to check if the on-premises tenant name is available
    public async Task<ServiceResponse<TrueFalseResultDto>> IsOnPremTenantNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check OnPremTenant name availability. Please try again."
        };

        try
        {
            // Check if user input (tenant name) is valid (non-empty)
            if (string.IsNullOrEmpty(checkAvailabilityDto.UserInput))
            {
                // Log the invalid input and update the service response message
                _logger.LogError($"Invalid OnPremTenant name: '{checkAvailabilityDto.UserInput}'. User: {_username}");
                serviceResponse.Message = "The OnPremTenant name is invalid.";
                return serviceResponse;
            }

            // Check if an OnPremTenant with the same name already exists in the database (case-insensitive)
            var existingOnPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower()
                )
                .FirstOrDefaultAsync();

            // If OnPremTenant exists, return false indicating the name is not available
            if (existingOnPremTenant != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "OnPremTenant name already exists. Please enter a different name.";
                _logger.LogWarning($"OnPremTenant name '{checkAvailabilityDto.UserInput}' already exists. User: {_username}");
                return serviceResponse;
            }

            // If no OnPremTenant exists, return true indicating the name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant name is available.";
            _logger.LogInformation($"OnPremTenant name '{checkAvailabilityDto.UserInput}' is available. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs during the operation
            _logger.LogError(ex, "Error checking availability of OnPremTenant name.");
        }

        return serviceResponse;
    }

    // Method to retrieve all on-premises OnPremTenants
    public async Task<ServiceResponse<IEnumerable<OnPremTenantDto>>> GetAllOnPremTenantsAsync()
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<IEnumerable<OnPremTenantDto>>
        {
            Data = null,
            Message = "Failed to retrieve OnPremTenants. Please try again."
        };

        try
        {
            // 1. Get pure IQueryable directly from repository (never materialize first)
            // 2. Project directly to DTO at the DB level via SQL correlated subqueries
            // 3. Materialize with ToListAsync() exactly once inside the try/catch
            var tenantDtos = await _unitOfWork.OnPremTenantRepo
                .GetAllAsync()
                .AsNoTracking()
                .Select(t => new OnPremTenantDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Type = t.Type,
                    ExecutionTimeAllowed = t.ExecutionTimeAllowed,

                    // Generates: (SELECT COALESCE(SUM(d.ExecutionTime), 0.0) FROM ...)
                    ConsumedExecutionTime = t.OnPremInstances
                        .SelectMany(i => i.OnPremInstanceData)
                        .Sum(d => (double?)d.ExecutionTime) ?? 0d,

                    ContractStartDate = t.ContractStartDate,
                    ContractRenewalDate = t.ContractRenewalDate,
                    IsExecutionDisabled = t.IsExecutionDisabled,
                    IsLoginDisabled = t.IsLoginDisabled,
                    IsSsoAllowed = t.IsSsoAllowed,
                    IsBrandingAllowed = t.IsBrandingAllowed,
                    OurEmails = t.OurEmails,
                    TenantEmails = t.TenantEmails,

                    // Generates: EXISTS (SELECT 1 FROM ...)
                    IsAnyInstanceFailed = t.OnPremInstances.Any(i => i.NoOfInvalidCheck != 0),

                    CreatedByUser = t.CreatedByUser,
                    CreatedOn = t.CreatedOn,
                    LastModifiedByUser = t.LastModifiedByUser,
                    LastModifiedOn = t.LastModifiedOn
                })
                .OrderByDescending(o=>o.CreatedOn)
                .ToListAsync();

            // Return the projected DTOs
            serviceResponse.Data = tenantDtos;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "The OnPremTenants retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the operation
            _logger.LogError(ex, "Error occurred while fetching OnPremTenants.");
        }

        return serviceResponse;
    }

    // Method to retrieve an on-premises OnPremTenant by its ID
    public async Task<ServiceResponse<OnPremTenantDto>> GetOnPremTenantAsync(Guid onPremTenantId)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremTenantDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremTenant. Please try again."
        };

        try
        {
            // Fetch OnPremTenant by ID from the repository
            var onPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Id == onPremTenantId)
                .Include(i => i.OnPremInstances)
                    .ThenInclude(i2 => i2.OnPremInstanceData)
                .SingleOrDefaultAsync();

            // If OnPremTenant not found, return a 'not found' message
            if (onPremTenant == null)
            {
                _logger.LogWarning($"OnPremTenant with ID {onPremTenantId} not found. User: {_username}");
                serviceResponse.Message = "OnPremTenant not found.";
                return serviceResponse;
            }

            // Return the OnPremTenant data mapped to a DTO
            serviceResponse.Data = onPremTenant.Adapt<OnPremTenantDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved OnPremTenant with ID {onPremTenantId}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while fetching OnPremTenant.");
        }

        return serviceResponse;
    }

    // Method to retrieve an OnPremTenant by its name
    public async Task<ServiceResponse<OnPremTenantDto>> GetOnPremTenantByNameAsync(string onPremTenantName)
    {
        var serviceResponse = new ServiceResponse<OnPremTenantDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremTenant by name. Please try again."
        };

        try
        {
            // Validate that the OnPremTenant name is not null or empty
            if (string.IsNullOrWhiteSpace(onPremTenantName))
            {
                serviceResponse.Message = "OnPremTenant name cannot be empty.";
                return serviceResponse;
            }

            // Retrieve OnPremTenant by name (case-insensitive comparison)
            var onPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Name.ToLower() == onPremTenantName.ToLower())
                .FirstOrDefaultAsync();

            // If the OnPremTenant is not found, return a 'not found' message
            if (onPremTenant == null)
            {
                _logger.LogWarning($"OnPremTenant with name '{onPremTenantName}' not found. User: {_username}");
                serviceResponse.Message = "OnPremTenant not found.";
                return serviceResponse;
            }

            // Return the OnPremTenant data mapped to a DTO
            serviceResponse.Data = onPremTenant.Adapt<OnPremTenantDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved OnPremTenant with name '{onPremTenantName}'. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the operation
            _logger.LogError(ex, "Error occurred while fetching OnPremTenant by name.");
        }

        return serviceResponse;
    }

    // Method to create a new on-premises OnPremTenant
    public async Task<ServiceResponse<OnPremTenantDto>> InsertOnPremTenantAsync(OnPremTenantDto onPremTenantDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremTenantDto>
        {
            Data = null,
            Message = "Failed to insert OnPremTenant. Please try again."
        };

        try
        {
            // Check if the contract start date is valid (should not be in the past)
            if (onPremTenantDto.ContractStartDate.Date < DateTimeOffset.UtcNow.Date)
            {
                _logger.LogWarning("Contract start date for {TenantName} is in the past: {ContractStartDate}.", onPremTenantDto.Name, onPremTenantDto.ContractStartDate.ToString("yyyy-MM-dd"));
                serviceResponse.Message = "Contract start date cannot be in the past. It must be today or in the future.";
                return serviceResponse;
            }

            // Check if the contract renewal date is valid (should not be in the past)
            if (onPremTenantDto.ContractRenewalDate.Date < DateTimeOffset.UtcNow.Date)
            {
                _logger.LogWarning("Contract renewal date for {TenantName} is in the past: {ContractRenewalDate}.", onPremTenantDto.Name, onPremTenantDto.ContractRenewalDate.ToString("yyyy-MM-dd"));
                serviceResponse.Message = "Contract renewal date cannot be in the past.";
                return serviceResponse;
            }

            // Check if the OnPremTenant name already exists to avoid duplication (case-insensitive)
            var existingOnPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Name.ToLower() == onPremTenantDto.Name.ToLower())
                .FirstOrDefaultAsync();

            // If OnPremTenant exists, return a conflict response
            if (existingOnPremTenant != null)
            {
                _logger.LogWarning($"Attempt to insert duplicate OnPremTenant with name {onPremTenantDto.Name}. User: {_username}");
                serviceResponse.Message = "An OnPremTenant with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Create and save the new OnPremTenant in the repository
            var newOnPremTenant = onPremTenantDto.Adapt<OnPremTenant>();
            newOnPremTenant.CreatedByUser = _username;
            newOnPremTenant.LastModifiedByUser = _username;

            // Insert the new OnPremTenant
            await _unitOfWork.OnPremTenantRepo.InsertAsync(newOnPremTenant);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save OnPremTenant. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = newOnPremTenant.Adapt<OnPremTenantDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant inserted successfully.";
            _logger.LogInformation($"Successfully inserted new OnPremTenant with name {onPremTenantDto.Name}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while inserting OnPremTenant.");
        }

        return serviceResponse;
    }

    // Method to update an existing on-premises OnPremTenant
    public async Task<ServiceResponse<OnPremTenantDto>> UpdateOnPremTenantAsync(OnPremTenantDto onPremTenantDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremTenantDto>
        {
            Data = null,
            Message = "Failed to update OnPremTenant. Please try again."
        };

        try
        {
            // Retrieve the existing OnPremTenant by ID
            var existingOnPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Id == onPremTenantDto.Id)
                .FirstOrDefaultAsync();

            // If OnPremTenant not found, return a 'not found' message
            if (existingOnPremTenant == null)
            {
                _logger.LogWarning($"OnPremTenant with ID {onPremTenantDto.Id} not found for update. User: {_username}");
                serviceResponse.Message = "OnPremTenant not found.";
                return serviceResponse;
            }
            // Validate ContractStartDate: Check if it has changed and is valid (future or today)
            bool isContractStartDateValidAndChanged = existingOnPremTenant.ContractStartDate.Date != onPremTenantDto.ContractStartDate.Date
                                                      && onPremTenantDto.ContractStartDate.Date < DateTimeOffset.UtcNow.Date;

            // Validate ContractRenewalDate: Check if it has changed and is valid (future or today)
            bool isContractRenewalDateValidAndChanged = existingOnPremTenant.ContractRenewalDate.Date != onPremTenantDto.ContractRenewalDate.Date
                                                       && onPremTenantDto.ContractRenewalDate.Date < DateTimeOffset.UtcNow.Date;

            // If ContractStartDate is changed and invalid (in the past)
            if (isContractStartDateValidAndChanged)
            {
                _logger.LogWarning("Contract start date for {TenantName} is in the past: {ContractStartDate}.", onPremTenantDto.Name, onPremTenantDto.ContractStartDate.ToString("yyyy-MM-dd"));
                serviceResponse.Message = "Contract start date cannot be in the past. It must be today or in the future.";
                return serviceResponse;
            }

            // If ContractRenewalDate is changed and invalid (in the past)
            if (isContractRenewalDateValidAndChanged)
            {
                _logger.LogWarning("Contract renewal date for {TenantName} is in the past: {ContractRenewalDate}.", onPremTenantDto.Name, onPremTenantDto.ContractRenewalDate.ToString("yyyy-MM-dd"));
                serviceResponse.Message = "Contract renewal date cannot be in the past.";
                return serviceResponse;
            }

            // Check for duplicates based on the name, excluding the current OnPremTenant
            var duplicateOnPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w =>
                    w.Id != onPremTenantDto.Id &&
                    w.Name.ToLower() == onPremTenantDto.Name.ToLower())
                .FirstOrDefaultAsync();

            // If a duplicate OnPremTenant is found, return a conflict response
            if (duplicateOnPremTenant != null)
            {
                _logger.LogWarning($"Duplicate OnPremTenant found with name '{onPremTenantDto.Name}' (excluding current one). User: {_username}");
                serviceResponse.Message = "An OnPremTenant with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Update the OnPremTenant details and save the changes
            onPremTenantDto.Adapt(existingOnPremTenant);
            existingOnPremTenant.LastModifiedByUser = _username;
            existingOnPremTenant.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.OnPremTenantRepo.Update(existingOnPremTenant);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save updated OnPremTenant. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = existingOnPremTenant.Adapt<OnPremTenantDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant updated successfully.";
            _logger.LogInformation($"Successfully updated OnPremTenant with ID {onPremTenantDto.Id}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while updating OnPremTenant.");
        }

        return serviceResponse;
    }

    // Method to delete an OnPremTenant by ID
    public async Task<ServiceResponse<bool>> DeleteOnPremTenantAsync(Guid onPremTenantId)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete OnPremTenant. Please try again."
        };

        try
        {
            // Retrieve the OnPremTenant by ID
            var existingOnPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Id == onPremTenantId)
                .FirstOrDefaultAsync();

            // If OnPremTenant not found, return a 'not found' message
            if (existingOnPremTenant == null)
            {
                _logger.LogWarning($"OnPremTenant with ID {onPremTenantId} not found for deletion. User: {_username}");
                serviceResponse.Message = "OnPremTenant not found.";
                return serviceResponse;
            }

            // Delete the OnPremTenant from the repository
            _unitOfWork.OnPremTenantRepo.Delete(existingOnPremTenant);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save after deletion. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant deleted successfully.";
            _logger.LogInformation($"Successfully deleted OnPremTenant with ID {onPremTenantId}. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while deleting OnPremTenant.");
        }

        return serviceResponse;
    }

    // Method to delete multiple OnPremTenants by IDs
    public async Task<ServiceResponse<bool>> DeleteMultipleOnPremTenantsAsync(IEnumerable<Guid> onPremTenantIds)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete OnPremTenants. Please try again."
        };

        try
        {
            // Retrieve the OnPremTenants by their IDs
            var onPremTenantsToDelete = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => onPremTenantIds.Contains(w.Id))
                .ToListAsync();

            // If no OnPremTenants found for deletion, return an appropriate message
            if (!onPremTenantsToDelete.Any())
            {
                _logger.LogWarning($"No OnPremTenants found for deletion with IDs: {string.Join(", ", onPremTenantIds)}. User: {_username}");
                serviceResponse.Message = "No OnPremTenants found for deletion.";
                return serviceResponse;
            }

            // Delete the OnPremTenants from the repository
            _unitOfWork.OnPremTenantRepo.Delete(onPremTenantsToDelete);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save after bulk deletion. User: {_username}");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenants deleted successfully.";
            _logger.LogInformation($"Successfully deleted {onPremTenantsToDelete.Count} OnPremTenants. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while deleting multiple OnPremTenants.");
        }

        return serviceResponse;
    }

    // Method to search for OnPremTenants by name
    public async Task<ServiceResponse<IEnumerable<OnPremTenantDto>>> SearchOnPremTenantsByNameAsync(string onPremTenantName)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<IEnumerable<OnPremTenantDto>>
        {
            Data = null,
            Message = "Failed to search OnPremTenants. Please try again."
        };

        try
        {
            // Validate search term is not empty
            if (string.IsNullOrWhiteSpace(onPremTenantName))
            {
                serviceResponse.Message = "Search term cannot be empty.";
                return serviceResponse;
            }

            // Search for OnPremTenants whose name contains the search term
            var matchedOnPremTenants = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Name.ToLower().Contains(onPremTenantName.Trim().ToLower()))
                .ToListAsync();

            // Return matched OnPremTenants
            serviceResponse.Data = matchedOnPremTenants.Adapt<IEnumerable<OnPremTenantDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{matchedOnPremTenants.Count} OnPremTenant(s) found matching the search term.";
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while searching for OnPremTenants.");
        }

        return serviceResponse;
    }

    // Retrieves the statistics for a specific on-premises tenant by its unique tenant identifier.
    public async Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremTenantStatsByIdAsync(Guid onPremTenantId)
    {
        // Initialize the service response with a default failure message and null data
        var serviceResponse = new ServiceResponse<OnpremInstanceStaticDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremTenant statistics. Please try again."
        };

        try
        {
            var statsDto = await BuildTenantStatsAsync(onPremTenantId);

            // If the on-premises tenant is not found, return a failure response
            if (statsDto == null)
            {
                _logger.LogWarning($"OnPremTenant with tenant ID {onPremTenantId} not found. User: {_username}");
                serviceResponse.Message = "OnPremTenant not found.";
                return serviceResponse;
            }

            // Set the service response data, status, and success message
            serviceResponse.Data = statsDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant statistics retrieved successfully.";

            _logger.LogInformation($"Successfully retrieved statistics for OnPremTenant ID {onPremTenantId}. User: {_username}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving OnPremTenant statistics by ID.");
        }

        return serviceResponse;
    }

    // Retrieves the statistics for a specific on-premises tenant by its tenant name.
    public async Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremTenantStatsByNameAsync(string onPremTenantName)
    {
        // Initialize the service response with a default failure message and null data
        var serviceResponse = new ServiceResponse<OnpremInstanceStaticDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremTenant statistics by name. Please try again."
        };

        try
        {
            // Resolve the tenant id first (case-insensitive), then compute the statistics by id
            var onPremTenantId = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Name.ToLower() == onPremTenantName.ToLower())
                .Select(w => (Guid?)w.Id)
                .FirstOrDefaultAsync();

            // If the on-premises tenant is not found, return a failure response
            if (onPremTenantId == null)
            {
                _logger.LogWarning($"OnPremTenant with tenant name {onPremTenantName} not found. User: {_username}");
                serviceResponse.Message = "OnPremTenant not found.";
                return serviceResponse;
            }

            var statsDto = await BuildTenantStatsAsync(onPremTenantId.Value);

            // Set the service response data, status, and success message
            serviceResponse.Data = statsDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremTenant statistics retrieved successfully.";

            // Log the success of the operation
            _logger.LogInformation($"Successfully retrieved statistics for OnPremTenant with name '{onPremTenantName}'. User: {_username}");
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the process
            _logger.LogError(ex, "Error occurred while retrieving OnPremTenant statistics by name.");
        }

        return serviceResponse;
    }

    // Computes the statistics for a tenant directly in the database. Returns null when the tenant
    // does not exist.
    //
    // The previous implementation loaded the whole tenant -> instances -> instance-data graph into
    // memory and summed it in C#, which is what made the endpoint slow (20s+) and memory hungry
    // once the instance-data table grew. The queries below push the aggregation into PostgreSQL so
    // only a handful of scalar values travel back to the application:
    //
    //   * Both totals are computed in a single scan of the tenant's instance-data rows.
    //   * The current user / published-agent counts come from the single most recent validation row,
    //     which the (OnPremInstanceId, ValidatedOn) index serves as one backward index seek.
    private async Task<OnpremInstanceStaticDto?> BuildTenantStatsAsync(Guid onPremTenantId)
    {
        // Verify the tenant exists (cheap primary-key lookup). Checking existence separately
        // keeps the "not found" response while letting the aggregate run as a single pass over
        // the instance-data table.
        var tenantExists = await _unitOfWork.OnPremTenantRepo
            .GetByConditionAsync(t => t.Id == onPremTenantId)
            .AnyAsync();

        if (!tenantExists)
        {
            return null;
        }

        // Both totals are computed in a single scan over the tenant's instance data. Grouping by
        // a constant makes EF emit one aggregate query instead of a separate SUM subquery per
        // column.
        var aggregate = await _unitOfWork.OnPremInstanceDataRepo
            .GetByConditionAsync(d => d.OnPremInstance!.OnPremTenantId == onPremTenantId)
            .GroupBy(d => 1)
            .Select(g => new
            {
                TotalExecutionTimeConsumed = g.Sum(x => x.ExecutionTime),
                TotalExecutedJobs = g.Sum(x => (long)x.ExecutedJobs)
            })
            .FirstOrDefaultAsync();

        // The latest validation row provides the current user / published-agent counts
        var latestInstanceData = await _unitOfWork.OnPremInstanceDataRepo
            .GetByConditionAsync(d => d.OnPremInstance!.OnPremTenantId == onPremTenantId)
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
