namespace WorkspaceAPIs.Services;

public class ResourceShareService : IResourceShareService
{
    private readonly ILogger<ResourceShareService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ResourceShareService(
        ILogger<ResourceShareService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves all resource shares assigned to the current user, optionally filtered by resource type.
    public async Task<ServiceResponse<IEnumerable<ResourceShareDto>>> GetMyResourceSharesAsync(ResourceTypeEnum? resourceType)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<IEnumerable<ResourceShareDto>>
        {
            Data = null,
            Message = "Failed to retrieve shared resources. Please try again."
        };

        try
        {
            // Build query to fetch resource shares for the current user.
            var resourceSharesQuery = _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.UserId == _userId &&
                    (!resourceType.HasValue || w.ResourceType == resourceType)
                );

            // Include user details and map to DTO.
            serviceResponse.Data = await resourceSharesQuery
                .Include(x => x.User)
                .ProjectToType<ResourceShareDto>()
                .ToListAsync();

            // Prepare successful response.
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Shared resources retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[GetMyResourceSharesAsync] Failed to retrieve resources for UserId {UserId}",
                _userId);
        }

        return serviceResponse;
    }

    // Retrieves all users who have been granted access to a specific resource.
    public async Task<ServiceResponse<IEnumerable<ResourceShareDto>>> GetResourceSharesAsync(Guid resourceId)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<IEnumerable<ResourceShareDto>>
        {
            Data = null,
            Message = "Failed to retrieve resource shares. Please try again."
        };

        try
        {
            // Fetch all resource shares for the given resource and include user details.
            var resourceShares = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(x => x.ResourceId == resourceId)
                .Include(x => x.User)
                .ProjectToType<ResourceShareDto>()
                .ToListAsync();

            // Populate response with retrieved data.
            serviceResponse.Data = resourceShares;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource shares retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors for diagnostics.
            _logger.LogError(
                ex,
                "[GetResourceSharesAsync] Failed to retrieve resource shares for ResourceId {ResourceId}",
                resourceId);
        }

        return serviceResponse;
    }

    // Retrieves a specific resource share by its identifier.
    public async Task<ServiceResponse<ResourceShareDto>> GetResourceShareByIdAsync(Guid resourceShareId)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<ResourceShareDto>
        {
            Data = null,
            Message = "Failed to retrieve resource share. Please try again."
        };

        try
        {
            // Fetch the resource share including recipient details.
            var resourceShare = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(x => x.Id == resourceShareId)
                .Include(x => x.User)
                .ProjectToType<ResourceShareDto>()
                .SingleOrDefaultAsync();

            if (resourceShare == null)
            {
                // Log that the resource share was not found.
                _logger.LogWarning(
                    "[GetResourceShareByIdAsync] Resource share not found for Id {Id}",
                    resourceShareId);

                serviceResponse.Message = "Resource share not found.";
                return serviceResponse;
            }
            // Populate response.
            serviceResponse.Data = resourceShare;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource share retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[GetResourceShareByIdAsync] Failed to retrieve resource share for Id {Id}",
                resourceShareId);
        }

        return serviceResponse;
    }

    // Creates a new resource share and grants access to a specified user.
    public async Task<ServiceResponse<ResourceShareDto>> CreateResourceShareAsync(ResourceShareDto resourceShareDto)
    {
        // Initialize response with a default failure state.
        var serviceResponse = new ServiceResponse<ResourceShareDto>
        {
            Data = null,
            Message = "Failed to add resource access. Please try again."
        };

        try
        {
            // Check if the user already has access to this resource.
            var existingResource = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(x =>
                    x.ResourceId == resourceShareDto.ResourceId &&
                    x.ResourceType == resourceShareDto.ResourceType &&
                    x.UserId == resourceShareDto.UserId)
                .AnyAsync();

            // Prevent duplicate access assignments.
            if (existingResource)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "The user already has access to this resource.";
                return serviceResponse;
            }

            // Verify that the target user exists.
            var workspaceUser = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(x => x.Id == resourceShareDto.UserId)
                .SingleOrDefaultAsync();

            if (workspaceUser == null)
            {
                serviceResponse.Message = "The specified user does not exist.";
                return serviceResponse;
            }

            // Map DTO to entity for database insertion.
            var resourceShare = resourceShareDto.Adapt<ResourceShare>();

            // Insert the new resource share record.
            await _unitOfWork.ResourceShareRepo.InsertAsync(resourceShare);

            // Persist changes and verify success.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning(
                    "[CreateResourceShareAsync] Failed to persist resource share for ResourceId {ResourceId} and UserId {UserId}",
                    resourceShareDto.ResourceId,
                    resourceShareDto.UserId);
                return serviceResponse;
            }

            // Map persisted entity back to DTO for response.
            serviceResponse.Data = resourceShare.Adapt<ResourceShareDto>();

            // Set successful response details.
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource access granted successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected exceptions for debugging.
            _logger.LogError(
                ex,
                "[CreateResourceShareAsync] Failed for ResourceId {ResourceId}",
                resourceShareDto.ResourceId);
        }

        return serviceResponse;
    }

    // Updates an existing resource share.
    public async Task<ServiceResponse<ResourceShareDto>> UpdateResourceShareAsync(ResourceShareDto resourceShareDto)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<ResourceShareDto>
        {
            Data = null,
            Message = "Failed to update resource share. Please try again."
        };

        try
        {
            // Retrieve the existing resource share.
            var resourceShare = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(x => x.Id == resourceShareDto.Id)
                .SingleOrDefaultAsync();

            // Return if the resource share does not exist.
            if (resourceShare == null)
            {
                _logger.LogWarning(
                    "[UpdateResourceShareAsync] Resource share not found for Id {Id}",
                    resourceShareDto.Id);

                serviceResponse.Message = "Resource share not found.";
                return serviceResponse;
            }

            // Map updated DTO values to the entity.
            resourceShareDto.Adapt(resourceShare);

            // Update the entity in the repository.
            _unitOfWork.ResourceShareRepo.Update(resourceShare);

            // Persist changes.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning(
                    "[UpdateResourceShareAsync] Failed to persist changes for Id {Id}",
                    resourceShareDto.Id);

                return serviceResponse;
            }

            // Map updated entity back to DTO for response.
            serviceResponse.Data = resourceShare.Adapt<ResourceShareDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource share updated successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors.
            _logger.LogError(
                ex,
                "[UpdateResourceShareAsync] Unexpected error while updating resource share for Id {Id}",
                resourceShareDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a single resource share by its unique identifier.
    public async Task<ServiceResponse<bool>> DeleteResourceShareAsync(Guid resourceShareId)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove resource access. Please try again."
        };

        try
        {
            // Retrieve the resource share entity by its ID.
            var resourceShare = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(x => x.Id == resourceShareId)
                .SingleOrDefaultAsync();

            // Validate that the resource share exists.
            if (resourceShare == null)
            {
                serviceResponse.Message = "Resource share not found.";
                return serviceResponse;
            }

            // Mark the entity for deletion.
            _unitOfWork.ResourceShareRepo.Delete(resourceShare);

            // Persist changes to the database and check for success.
            if (!await _unitOfWork.SaveAsync())
            {
                // Log failure if SaveAsync did not succeed.
                _logger.LogError(
                    "[DeleteResourceShareAsync] Failed to persist deletion for resource share Id {Id}",
                    resourceShareId);
                return serviceResponse;
            }

            // Set success response after successful deletion.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource share deleted successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected exceptions.
            _logger.LogError(
                ex,
                "[DeleteResourceShareAsync] Exception occurred while deleting resource share Id {Id}",
                resourceShareId);
        }

        return serviceResponse;
    }

    // Deletes multiple resource shares by their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteResourceSharesAsync(IEnumerable<Guid> resourceShareIds)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove resource access. Please try again."
        };

        try
        {
            // Validate input collection.
            if (resourceShareIds == null || !resourceShareIds.Any())
            {
                serviceResponse.Message = "No resource share IDs were provided for deletion.";
                return serviceResponse;
            }

            // Retrieve all resource shares matching the provided IDs.
            var resourceShares = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(x => resourceShareIds.Contains(x.Id))
                .ToListAsync();

            // Validate that matching resource shares were found.
            if (!resourceShares.Any())
            {
                serviceResponse.Message = "No matching resource shares were found.";
                return serviceResponse;
            }

            // Mark all retrieved resource shares for deletion.
            _unitOfWork.ResourceShareRepo.Delete(resourceShares);

            // Persist changes to the database and verify success.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[DeleteResourceSharesAsync] Failed to persist deletion for resource share IDs: {Ids}",
                    string.Join(", ", resourceShareIds));

                return serviceResponse;
            }

            // Prepare successful response.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{resourceShares.Count} resource share(s) removed successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected exceptions for diagnostics.
            _logger.LogError(
                ex,
                "[DeleteResourceSharesAsync] Exception occurred while deleting resource shares: {Ids}",
                string.Join(", ", resourceShareIds));
        }

        return serviceResponse;
    }
}