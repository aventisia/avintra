namespace GlobalAdminAPIs.Services;

/// <summary>
/// Service for managing on-premises tenant data, including CRUD operations, availability checks,
/// and bulk deletion of on-premises tenant data.
/// </summary>
public class OnPremInstanceDataService : IOnPremInstanceDataService
{
    private readonly ILogger<OnPremInstanceDataService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public OnPremInstanceDataService(
        ILogger<OnPremInstanceDataService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Retrieve the user ID from the JWT claims for associating operations with a specific user
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves all on-premises tenant data by tenant ID.
    public async Task<ServiceResponse<IEnumerable<OnPremInstanceDataDto>>> GetAllOnPremInstanceDataAsync(Guid onPremInstanceId, DateTimeOffset? startDate, DateTimeOffset? endDate)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<IEnumerable<OnPremInstanceDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve OnPremInstance data. Please try again."
        };

        try
        {
            // Convert the (optional) calendar-day filters into a half-open [start, end + 1 day)
            // range. Comparing the raw column against a half-open range keeps the predicate
            // sargable, so PostgreSQL can use the (OnPremInstanceId, ValidatedOn) index rather
            // than applying a date function to every row (which the previous .Date comparison
            // forced and which prevented index usage).
            var (rangeStart, rangeEndExclusive) = NormalizeDateRange(startDate, endDate);

            // Filter and project to the DTO inside the database. The repository already applies
            // AsNoTracking and only the columns required by the DTO are selected, so no entity
            // graph is tracked and no unnecessary columns are transferred.
            var OnPremInstanceData = await _unitOfWork.OnPremInstanceDataRepo
                .GetByConditionAsync(w =>
                    w.OnPremInstanceId == onPremInstanceId &&
                    w.ValidatedOn >= rangeStart &&
                    w.ValidatedOn < rangeEndExclusive
                )
                .OrderByDescending(o => o.ValidatedOn)
                .Select(d => new OnPremInstanceDataDto
                {
                    Id = d.Id,
                    ValidatedOn = d.ValidatedOn,
                    ValidatedBy = d.ValidatedBy,
                    ExecutedJobs = d.ExecutedJobs,
                    ExecutionTime = (int)d.ExecutionTime,
                    Users = d.Users,
                    PublishedAgents = d.PublishedAgents,
                    OnPremInstanceId = d.OnPremInstanceId
                })
                .ToListAsync();

            // Return the projected DTOs
            serviceResponse.Data = OnPremInstanceData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstance data retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved {OnPremInstanceData.Count} OnPremInstance data for tenant ID {onPremInstanceId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching OnPremInstance data.");
        }

        return serviceResponse;
    }

    // Normalizes the optional start/end filters into a half-open [start, end + 1 day) range,
    // preserving inclusive calendar days. Each bound defaults independently: a missing start is
    // 15 days before the end date, a missing end is 15 days after the start date, and with both
    // missing the window is the last 15 days.
    private static (DateTimeOffset Start, DateTimeOffset EndExclusive) NormalizeDateRange(DateTimeOffset? startDate, DateTimeOffset? endDate)
    {
        var today = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);

        var start = startDate ?? endDate?.AddDays(-15) ?? today.AddDays(-15);
        var end = endDate ?? (startDate.HasValue ? start.AddDays(15) : today);

        var startOfRange = new DateTimeOffset(start.Year, start.Month, start.Day, 0, 0, 0, start.Offset);
        var endOfRangeExclusive = new DateTimeOffset(end.Year, end.Month, end.Day, 0, 0, 0, end.Offset).AddDays(1);

        return (startOfRange, endOfRangeExclusive);
    }

    // Retrieves on-premises tenant data by its ID.
    public async Task<ServiceResponse<OnPremInstanceDataDto>> GetOnPremInstanceDataByIdAsync(Guid OnPremInstanceDataId)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremInstanceDataDto>
        {
            Data = null,
            Message = "Failed to retrieve OnPremInstance data. Please try again."
        };

        try
        {
            // Fetch OnPremInstanceData by ID
            var OnPremInstanceData = await _unitOfWork.OnPremInstanceDataRepo
                .GetByConditionAsync(w => w.Id == OnPremInstanceDataId)
                .SingleOrDefaultAsync();

            // If not found, return an appropriate message
            if (OnPremInstanceData == null)
            {
                _logger.LogWarning($"OnPremInstanceData with ID {OnPremInstanceDataId} not found.");
                serviceResponse.Message = "OnPremInstanceData not found.";
                return serviceResponse;
            }

            // Return the OnPremInstanceData mapped to OnPremInstanceDataDto
            serviceResponse.Data = OnPremInstanceData.Adapt<OnPremInstanceDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstanceData retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved OnPremInstanceData with ID {OnPremInstanceDataId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching OnPremInstanceData.");
        }

        return serviceResponse;
    }

    // Inserts a new on-premises tenant data record.
    public async Task<ServiceResponse<OnPremInstanceDataDto>> InsertOnPremInstanceDataAsync(OnPremInstanceDataDto onPremInstanceDataDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremInstanceDataDto>
        {
            Data = null,
            Message = "Failed to insert OnPremInstanceData. Please try again."
        };

        try
        {
            // Check if the OnPremInstanceData exists
            var existingOnPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Id == onPremInstanceDataDto.OnPremInstanceId)
                .FirstOrDefaultAsync();

            // If it does not exist, return a 'not found' response
            if (existingOnPremInstance == null)
            {
                _logger.LogWarning($"OnPremInstanceData with OnPremInstanceId {onPremInstanceDataDto.OnPremInstanceId} not found.");
                serviceResponse.Message = "OnPremInstanceData not found.";
                return serviceResponse;
            }


            // Create and save the new OnPremInstanceData in the repository
            var newOnPremInstanceData = onPremInstanceDataDto.Adapt<OnPremInstanceData>();
            newOnPremInstanceData.ValidatedOn = DateTimeOffset.UtcNow;

            // Insert the new OnPremInstanceData
            await _unitOfWork.OnPremInstanceDataRepo.InsertAsync(newOnPremInstanceData);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save OnPremInstanceData.");
                return serviceResponse;
            }

            serviceResponse.Data = newOnPremInstanceData.Adapt<OnPremInstanceDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstanceData inserted successfully.";
            _logger.LogInformation($"Successfully inserted new OnPremInstanceData with OnPremInstanceId {onPremInstanceDataDto.OnPremInstanceId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while inserting OnPremInstanceData.");
        }

        return serviceResponse;
    }

    // Updates an existing on-premises tenant data record.
    public async Task<ServiceResponse<OnPremInstanceDataDto>> UpdateOnPremInstanceDataAsync(OnPremInstanceDataDto onPremInstanceDataDto)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<OnPremInstanceDataDto>
        {
            Data = null,
            Message = "Failed to update OnPremInstanceData. Please try again."
        };

        try
        {
            // Retrieve the existing OnPremInstanceData by ID
            var existingOnPremInstanceData = await _unitOfWork.OnPremInstanceDataRepo
                .GetByConditionAsync(w => w.Id == onPremInstanceDataDto.Id)
                .FirstOrDefaultAsync();

            // If not found, return a 'not found' message
            if (existingOnPremInstanceData == null)
            {
                _logger.LogWarning($"OnPremInstanceData with ID {onPremInstanceDataDto.Id} not found for update.");
                serviceResponse.Message = "OnPremInstanceData not found.";
                return serviceResponse;
            }

            // Update the OnPremInstanceData details
            onPremInstanceDataDto.Adapt(existingOnPremInstanceData);

            // Update the OnPremInstanceData in the repository
            _unitOfWork.OnPremInstanceDataRepo.Update(existingOnPremInstanceData);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated OnPremInstanceData.");
                return serviceResponse;
            }

            serviceResponse.Data = existingOnPremInstanceData.Adapt<OnPremInstanceDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstanceData updated successfully.";
            _logger.LogInformation($"Successfully updated OnPremInstanceData with ID {existingOnPremInstanceData.Id}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating OnPremInstanceData.");
        }

        return serviceResponse;
    }

    // Deletes an on-premises tenant data record by its ID.
    public async Task<ServiceResponse<bool>> DeleteOnPremInstanceDataAsync(Guid onPremInstanceDataId)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete OnPremInstanceData. Please try again."
        };

        try
        {
            // Retrieve the OnPremInstanceData by ID
            var existingOnPremInstanceData = await _unitOfWork.OnPremInstanceDataRepo
                .GetByConditionAsync(w => w.Id == onPremInstanceDataId)
                .FirstOrDefaultAsync();

            // If not found, return a 'not found' message
            if (existingOnPremInstanceData == null)
            {
                _logger.LogWarning($"OnPremInstanceData with ID {onPremInstanceDataId} not found for deletion.");
                serviceResponse.Message = "OnPremInstanceData not found.";
                return serviceResponse;
            }

            // Delete the OnPremInstanceData from the repository
            _unitOfWork.OnPremInstanceDataRepo.Delete(existingOnPremInstanceData);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save after deletion.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstanceData deleted successfully.";
            _logger.LogInformation($"Successfully deleted OnPremInstanceData with ID {onPremInstanceDataId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting OnPremInstanceData.");
        }

        return serviceResponse;
    }

    // Deletes multiple on-premises tenant data records by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleOnPremInstanceDataAsync(IEnumerable<Guid> onPremInstanceDataIds)
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete OnPremInstanceData. Please try again."
        };

        try
        {
            // Retrieve the OnPremInstanceData by their IDs
            var onPremInstanceDataToDelete = await _unitOfWork.OnPremInstanceDataRepo
                .GetByConditionAsync(w => onPremInstanceDataIds.Contains(w.Id))
                .ToListAsync();

            // If no OnPremInstanceData found for deletion, return an appropriate message
            if (!onPremInstanceDataToDelete.Any())
            {
                _logger.LogWarning($"No OnPremInstanceData found for deletion with IDs: {string.Join(", ", onPremInstanceDataIds)}.");
                serviceResponse.Message = "No OnPremInstanceData found for deletion.";
                return serviceResponse;
            }

            // Delete the OnPremInstanceData from the repository
            _unitOfWork.OnPremInstanceDataRepo.Delete(onPremInstanceDataToDelete);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save after bulk deletion.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstanceData deleted successfully.";
            _logger.LogInformation($"Successfully deleted {onPremInstanceDataToDelete.Count} OnPremInstanceData records.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting multiple OnPremInstanceData records.");
        }

        return serviceResponse;
    }
}
