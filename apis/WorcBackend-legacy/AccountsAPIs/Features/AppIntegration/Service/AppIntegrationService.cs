namespace AccountsAPIs.Services;

public class AppIntegrationService : IAppIntegrationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AppIntegrationService> _logger;
    private readonly Guid _userId;

    public AppIntegrationService(IUnitOfWork unitOfWork, ILogger<AppIntegrationService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from the HTTP context, if available
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieve all app integrations
    public async Task<ServiceResponse<IEnumerable<AppIntegrationDto>>> GetAllAppIntegrationsAsync()
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<AppIntegrationDto>>
        {
            Data = null,
            Message = "Failed to fetch app integrations. Please try again later."
        };

        try
        {
            // Fetch all app integrations along with related created-by-user information
            var appIntegrations = await _unitOfWork.AppIntegrationRepo
                .GetAllAsync()
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            // Map the fetched data to DTOs
            serviceResponse.Data = appIntegrations.Adapt<IEnumerable<AppIntegrationDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App integrations fetched successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching app integrations.");
        }

        return serviceResponse;
    }

    // Retrieve a specific app integration by its ID
    public async Task<ServiceResponse<AppIntegrationDto>> GetAppIntegrationByIdAsync(Guid appIntegrationId)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppIntegrationDto>
        {
            Data = null,
            Message = "Unable to fetch the app integration. Please try again later."
        };

        try
        {

            // Fetch the specific app integration by its ID
            var appIntegration = await _unitOfWork.AppIntegrationRepo
                .GetByConditionAsync(w => w.Id == appIntegrationId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no integration is found, log a warning and set the appropriate message
            if (appIntegration == null)
            {
                _logger.LogWarning("No app integration found with ID: {AppIntegrationId}", appIntegrationId);
                serviceResponse.Message = "App integration not found.";
                return serviceResponse;
            }

            // Map the fetched data to DTO and return success response
            serviceResponse.Data = appIntegration.Adapt<AppIntegrationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App integration retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching app integration with ID: {AppIntegrationId}", appIntegrationId);
        }

        return serviceResponse;
    }

    // Create a new app integration
    public async Task<ServiceResponse<AppIntegrationDto>> CreateAppIntegrationAsync(AppIntegrationDto appIntegrationDto)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppIntegrationDto>
        {
            Data = null,
            Message = "Failed to create app integration. Please try again later."
        };

        try
        {

            // Check if an integration with the same name already exists
            var existingIntegration = await _unitOfWork.AppIntegrationRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appIntegrationDto.Name.ToLower())
                .SingleOrDefaultAsync();

            if (existingIntegration != null)
            {
                _logger.LogWarning("App integration creation aborted. An integration named '{AppIntegrationName}' already exists.", appIntegrationDto.Name);
                serviceResponse.Message = $"An app integration named '{appIntegrationDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up the DTO properties
            appIntegrationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appIntegrationDto);

            // Map DTO to entity and set user-related fields
            var newAppIntegration = appIntegrationDto.Adapt<AppIntegration>();
            newAppIntegration.CreatedByUserId = _userId;
            newAppIntegration.LastModifiedByUserId = _userId;

            // Save the new integration to the database
            await _unitOfWork.AppIntegrationRepo.InsertAsync(newAppIntegration);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save newly created app integration: {AppIntegrationName}", appIntegrationDto.Name);
                return serviceResponse;
            }

            // Return success response with created data
            serviceResponse.Data = newAppIntegration.Adapt<AppIntegrationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App integration created successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while creating app integration: {AppIntegrationName}", appIntegrationDto.Name);
        }

        return serviceResponse;
    }

    // Update an existing app integration
    public async Task<ServiceResponse<AppIntegrationDto>> UpdateAppIntegrationAsync(AppIntegrationDto appIntegrationDto)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppIntegrationDto>
        {
            Data = null,
            Message = "Failed to update app integration. Please try again later."
        };

        try
        {

            // Fetch the existing app integration to update
            var existingAppIntegration = await _unitOfWork.AppIntegrationRepo
                .GetByConditionAsync(w => w.Id == appIntegrationDto.Id)
                .SingleOrDefaultAsync();

            if (existingAppIntegration == null)
            {
                _logger.LogWarning("Update failed. No app integration found with ID: {AppIntegrationId}", appIntegrationDto.Id);
                serviceResponse.Message = "App integration not found.";
                return serviceResponse;
            }

            // Check for a duplicate app integration with the same name (excluding the current one)
            var duplicateIntegration = await _unitOfWork.AppIntegrationRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appIntegrationDto.Name.ToLower() && w.Id != appIntegrationDto.Id)
                .SingleOrDefaultAsync();

            if (duplicateIntegration != null)
            {
                _logger.LogWarning("Update failed. App integration with name '{AppIntegrationName}' already exists.", appIntegrationDto.Name);
                serviceResponse.Message = $"An app integration with the name '{appIntegrationDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up the DTO properties
            appIntegrationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appIntegrationDto);

            // Apply updates to the existing entity
            appIntegrationDto.Adapt(existingAppIntegration);
            existingAppIntegration.LastModifiedByUserId = _userId;

            // Save the updated integration to the database
            _unitOfWork.AppIntegrationRepo.Update(existingAppIntegration);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated app integration: {AppIntegrationId}", appIntegrationDto.Id);
                return serviceResponse;
            }

            // Return success response with updated data
            serviceResponse.Data = existingAppIntegration.Adapt<AppIntegrationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App integration updated successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating app integration with ID: {AppIntegrationId}", appIntegrationDto.Id);
        }

        return serviceResponse;
    }

    // Delete a single app integration by ID
    public async Task<ServiceResponse<bool>> DeleteAppIntegrationAsync(Guid appIntegrationId)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete app integration. Please try again later."
        };

        try
        {

            // Fetch the app integration to be deleted
            var appIntegration = await _unitOfWork.AppIntegrationRepo
                .GetByConditionAsync(w => w.Id == appIntegrationId)
                .SingleOrDefaultAsync();

            if (appIntegration == null)
            {
                _logger.LogWarning("No app integration found with ID: {AppIntegrationId}", appIntegrationId);
                serviceResponse.Message = "App integration not found.";
                return serviceResponse;
            }

            // Delete the app integration
            _unitOfWork.AppIntegrationRepo.Delete(appIntegration);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete app integration with ID: {AppIntegrationId} due to database save error.", appIntegrationId);
                return serviceResponse;
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App integration deleted successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting app integration with ID: {AppIntegrationId}", appIntegrationId);
        }

        return serviceResponse;
    }

    // Delete multiple app integrations by their IDs
    public async Task<ServiceResponse<bool>> DeleteAppIntegrationsAsync(List<Guid> appIntegrationIds)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete app integrations. Please try again later."
        };

        try
        {

            // Fetch the app integrations to be deleted
            var appIntegrations = await _unitOfWork.AppIntegrationRepo
                .GetByConditionAsync(w => appIntegrationIds.Contains(w.Id))
                .ToListAsync();

            if (appIntegrations == null || appIntegrations.Count == 0)
            {
                _logger.LogWarning("No app integrations found for deletion.");
                serviceResponse.Message = "No app integrations found to delete.";
                return serviceResponse;
            }

            // Delete the app integrations
            _unitOfWork.AppIntegrationRepo.Delete(appIntegrations);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to commit bulk deletion of app integrations.");
                return serviceResponse;
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App integrations deleted successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while bulk deleting app integrations.");
        }

        return serviceResponse;
    }
}