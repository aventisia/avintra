namespace WorkspaceAPIs.Services;

public class ResourceShareService : IResourceShareService
{
    private readonly ILogger<ResourceShareService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly string? _jwt;

    public ResourceShareService(
        ILogger<ResourceShareService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IHttpClientFactory httpClientFactory,
        EnvironmentConfig environmentConfig)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _httpClientFactory = httpClientFactory;
        _environmentConfig = environmentConfig;

        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        // Extract the JWT from the cookie (or Authorization header) so it can be
        // forwarded to AccountsAPIs as a Bearer token for the cross-API sync.
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext);
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
                .Include(i => i.User)
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
                .GetByConditionAsync(w => w.ResourceId == resourceId)
                .Include(i => i.User)
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
                .GetByConditionAsync(w => w.Id == resourceShareId)
                .Include(i => i.User)
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
            // Block sharing a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceShareGuard.ValidateAsync<ResourceShareDto>(
                _unitOfWork,
                resourceShareDto.ResourceType,
                resourceShareDto.ResourceId,
                "share");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            // Check if the user already has access to this resource.
            var existingResource = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == resourceShareDto.ResourceId &&
                    w.ResourceType == resourceShareDto.ResourceType &&
                    w.UserId == resourceShareDto.UserId)
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
                .GetByConditionAsync(w => w.Id == resourceShareDto.UserId)
                .SingleOrDefaultAsync();

            if (workspaceUser == null)
            {
                serviceResponse.Message = "The specified user does not exist.";
                return serviceResponse;
            }

            // Map DTO to entity for database insertion.
            var resourceShare = resourceShareDto.Adapt<ResourceShare>();
            resourceShare.TenantId = _currentTenantService.CurrentTenantId;

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

    // Creates resource shares and grants access to multiple users for the specified resource.
    public async Task<ServiceResponse<bool>> CreateBulkResourceShareAsync(CreateResourceShareDto createResourceShareDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to add resource access. Please try again."
        };

        try
        {
            // Block sharing a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceShareGuard.ValidateAsync<bool>(
                _unitOfWork,
                createResourceShareDto.ResourceType,
                createResourceShareDto.ResourceId,
                "share");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            var userIds = createResourceShareDto.Users
                .Select(s => s.UserId)
                .Distinct()
                .ToList();

            // Get existing shares in one query.
            var existingShares = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == createResourceShareDto.ResourceId &&
                    w.ResourceType == createResourceShareDto.ResourceType &&
                    userIds.Contains(w.UserId))
                .ToListAsync();

            var existingUserIds = existingShares
                .Select(s => s.UserId)
                .ToHashSet();

            // Get valid users in one query.
            var validUsers = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => userIds.Contains(w.Id))
                .Select(s => s.Id)
                .ToListAsync();

            var validUserIds = validUsers.ToHashSet();

            // Build entities in memory.
            var resourceShares = createResourceShareDto.Users
                .Where(w => validUserIds.Contains(w.UserId) && !existingUserIds.Contains(w.UserId))
                .Select(s => new ResourceShare
                {
                    ResourceId = createResourceShareDto.ResourceId,
                    ResourceType = createResourceShareDto.ResourceType,
                    UserId = s.UserId,
                    AccessLevel = s.AccessLevel,
                    TenantId = _currentTenantService.CurrentTenantId
                })
                .ToList();

            if (!resourceShares.Any())
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "No valid users found or access already exists.";
                return serviceResponse;
            }

            // Bulk insert.
            await _unitOfWork.ResourceShareRepo.InsertAsync(resourceShares);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning(
                    "[CreateBulkResourceShareAsync] Failed for ResourceId {ResourceId}",
                    createResourceShareDto.ResourceId);

                return serviceResponse;
            }

            // For Space resources, sync the AccountsAPIs SpaceUser table so the
            // space membership is reflected in the Tenant Admin Users table.
            if (createResourceShareDto.ResourceType == ResourceTypeEnum.Space)
            {
                await SyncSpaceUsersAsync(
                    createResourceShareDto.ResourceId,
                    resourceShares.Select(s => s.UserId).ToList(),
                    add: true);
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource access granted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[CreateBulkResourceShareAsync] Failed for ResourceId {ResourceId}",
                createResourceShareDto.ResourceId);
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
                .GetByConditionAsync(w => w.Id == resourceShareDto.Id)
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

            // Block sharing a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceShareGuard.ValidateAsync<ResourceShareDto>(
                _unitOfWork,
                resourceShare.ResourceType,
                resourceShare.ResourceId,
                "change sharing for");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
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

    // Enables or disables tenant-wide access for a specific resource.
    public async Task<ServiceResponse<bool>> UpdateTenantWideAccessAsync(UpdateTenantWideAccessDto updateTenantWideAccessDto)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Resource not found. Please try again."
        };

        try
        {
            // Block sharing a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceShareGuard.ValidateAsync<bool>(
                _unitOfWork,
                updateTenantWideAccessDto.ResourceType,
                updateTenantWideAccessDto.ResourceId,
                "change sharing for");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            // Update tenant-wide access based on the resource type.
            switch (updateTenantWideAccessDto.ResourceType)
            {
                case ResourceTypeEnum.Queue:
                    {
                        // Retrieve the Queue resource.
                        var queue = await _unitOfWork.QueueRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (queue == null)
                            return serviceResponse;

                        // Update tenant-wide access.
                        queue.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.QueueRepo.Update(queue);
                        break;
                    }

                case ResourceTypeEnum.Trigger:
                    {
                        // Retrieve the Trigger resource.
                        var trigger = await _unitOfWork.TriggerRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (trigger == null)
                            return serviceResponse;

                        trigger.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.TriggerRepo.Update(trigger);
                        break;
                    }

                case ResourceTypeEnum.KeyStore:
                    {
                        // Retrieve the KeyStore resource.
                        var keyStore = await _unitOfWork.KeyStoreRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (keyStore == null)
                            return serviceResponse;

                        keyStore.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.KeyStoreRepo.Update(keyStore);
                        break;
                    }

                case ResourceTypeEnum.AppSecret:
                    {
                        // Retrieve the AppSecret resource.
                        var appSecret = await _unitOfWork.AppSecretRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (appSecret == null)
                            return serviceResponse;

                        appSecret.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.AppSecretRepo.Update(appSecret);
                        break;
                    }

                case ResourceTypeEnum.KnowledgeBase:
                    {
                        // Retrieve the KnowledgeBase resource.
                        var knowledgeBase = await _unitOfWork.KnowledgeBaseRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (knowledgeBase == null)
                            return serviceResponse;

                        knowledgeBase.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.KnowledgeBaseRepo.Update(knowledgeBase);
                        break;
                    }

                case ResourceTypeEnum.Flow:
                    {
                        // Retrieve the Flow resource.
                        var flow = await _unitOfWork.FlowRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (flow == null)
                            return serviceResponse;

                        flow.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.FlowRepo.Update(flow);
                        break;
                    }

                case ResourceTypeEnum.FlowVersion:
                    {
                        // Retrieve the FlowVersion resource.
                        var flowVersion = await _unitOfWork.FlowVersionRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (flowVersion == null)
                            return serviceResponse;

                        flowVersion.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.FlowVersionRepo.Update(flowVersion);
                        break;
                    }

                case ResourceTypeEnum.Skill:
                    {
                        // Retrieve the Skill resource.
                        var skill = await _unitOfWork.SkillRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (skill == null)
                            return serviceResponse;

                        skill.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.SkillRepo.Update(skill);
                        break;
                    }

                case ResourceTypeEnum.Tool:
                    {
                        // Retrieve the Tool resource.
                        var tool = await _unitOfWork.ToolRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (tool == null)
                            return serviceResponse;

                        tool.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.ToolRepo.Update(tool);
                        break;
                    }

                default:
                    return serviceResponse;
            }

            // Persist all pending changes.
            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Message = "Failed to update tenant-wide access changes.";
                return serviceResponse;
            }

            // Success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant-wide access updated successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors.
            _logger.LogError(
                ex,
                "[UpdateTenantWideAccessAsync] Unexpected error while updating tenant-wide access for Type {Type} and Id {Id}",
                updateTenantWideAccessDto.ResourceType,
                updateTenantWideAccessDto.ResourceId);
        }

        return serviceResponse;
    }

    // Revokes the current user's access to the specified resource.
    public async Task<ServiceResponse<bool>> RevokeMyAccessAsync(Guid resourceId)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to revoke resource access. Please try again."
        };

        try
        {

            // Retrieve the user's resource share for the specified resource.
            var resourceShare = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == resourceId &&
                    w.UserId == _userId)
                .FirstOrDefaultAsync();

            // Validate that the resource share exists.
            if (resourceShare == null)
            {
                serviceResponse.Message = "Access record not found.";
                return serviceResponse;
            }

            // Block removing access from a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceShareGuard.ValidateAsync<bool>(
                _unitOfWork,
                resourceShare.ResourceType,
                resourceShare.ResourceId,
                "remove access from");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            // Remove the user's access record.
            _unitOfWork.ResourceShareRepo.Delete(resourceShare);

            // Persist changes.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[RevokeMyAccessAsync] Failed to revoke access for UserId {UserId} and ResourceId {ResourceId}",
                    _userId,
                    resourceId);

                return serviceResponse;
            }

            // Set success response.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Access revoked successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected exceptions.
            _logger.LogError(
                ex,
                "[RevokeMyAccessAsync] Exception occurred while revoking access for ResourceId {ResourceId}",
                resourceId);
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
                .GetByConditionAsync(w => w.Id == resourceShareId)
                .SingleOrDefaultAsync();

            // Validate that the resource share exists.
            if (resourceShare == null)
            {
                serviceResponse.Message = "Resource share not found.";
                return serviceResponse;
            }

            // Block removing access from a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceShareGuard.ValidateAsync<bool>(
                _unitOfWork,
                resourceShare.ResourceType,
                resourceShare.ResourceId,
                "remove access from");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
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

            // For Space resources, sync the AccountsAPIs SpaceUser table so the
            // space membership is reflected in the Tenant Admin Users table.
            if (resourceShare.ResourceType == ResourceTypeEnum.Space)
            {
                await SyncSpaceUsersAsync(
                    resourceShare.ResourceId,
                    new List<Guid> { resourceShare.UserId },
                    add: false);
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
                .GetByConditionAsync(w => resourceShareIds.Contains(w.Id))
                .ToListAsync();

            // Validate that matching resource shares were found.
            if (!resourceShares.Any())
            {
                serviceResponse.Message = "No matching resource shares were found.";
                return serviceResponse;
            }

            // Block removing access from published (PROD) resources in a batched check.
            var prodShareBlock = await ProdResourceShareGuard.ValidateManyAsync<bool>(
                _unitOfWork,
                resourceShares.Select(resourceShare => (resourceShare.ResourceType, resourceShare.ResourceId)),
                "remove access from");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
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


    // Validate whether current user has permission to perform an operation on a resource
    public async Task<(bool HasAccess, ResourceAccessTypeEnum? AccessLevel)> GetResourceAccessAsync(
        Guid userId,
        Guid resourceId,
        ResourceTypeEnum resourceType,
        Guid createdByUserId,
        bool isTenantWideAccess = false,
        params ResourceAccessTypeEnum[] accessLevels)
    {
        try
        {
            // Resource owner has full access
            if (createdByUserId == userId)
            {
                return (true, ResourceAccessTypeEnum.Owner);
            }

            // Tenant-wide resources are accessible to all users
            if (isTenantWideAccess)
            {
                return (true, ResourceAccessTypeEnum.View);
            }

            // Retrieve user's access level for the resource
            var access = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.UserId == userId &&
                    w.ResourceId == resourceId &&
                    w.ResourceType == resourceType)
                .Select(s => (ResourceAccessTypeEnum?)s.AccessLevel)
                .FirstOrDefaultAsync();

            // Check whether the access level is sufficient
            var allowed = access.HasValue && accessLevels.Contains(access.Value);

            if (!allowed)
            {
                _logger.LogWarning(
                    "Access denied for User {UserId}. Resource {ResourceId}, Type {ResourceType}",
                    userId,
                    resourceId,
                    resourceType);
            }

            return (allowed, access);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error validating access for User {UserId}, Resource {ResourceId}",
                userId,
                resourceId);

            return (false, null);
        }
    }

    // Retrieve resource identifiers accessible to current user for specific access levels
    public async Task<List<Guid>> GetAccessibleResourceIdsAsync(
        Guid userId,
        ResourceTypeEnum resourceType,
        params ResourceAccessTypeEnum[] accessLevels)
    {
        try
        {
            // Convert access levels to a list for query
            var accessLevelsList = accessLevels is { Length: > 0 }
                ? accessLevels.ToList()
                : Enum.GetValues<ResourceAccessTypeEnum>().ToList();

            // Retrieve resource share mappings matching requested access levels
            var resourceShareIds = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.UserId == userId &&
                    w.ResourceType == resourceType &&
                    accessLevelsList.Contains(w.AccessLevel))
                .Select(s => s.ResourceId)
                .ToListAsync();

            // Return accessible resource ids
            return resourceShareIds;
        }
        catch (Exception ex)
        {
            // Log access retrieval failure
            _logger.LogError(
                ex,
                "Failed retrieving accessible resources for User {UserId}",
                userId);

            return new();
        }
    }

    // Retrieve resource identifiers and corresponding access levels
    public async Task<Dictionary<Guid, ResourceAccessTypeEnum>> GetAccessibleResourcesWithAccessAsync(
        Guid userId,
        ResourceTypeEnum resourceType,
        params ResourceAccessTypeEnum[] accessLevels)
    {
        try
        {
            // Convert access levels to a list for query
            var accessLevelsList = accessLevels is { Length: > 0 }
                ? accessLevels.ToList()
                : Enum.GetValues<ResourceAccessTypeEnum>().ToList();

            // Query resource share mappings for the user and requested access levels
            var accessibleResources = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.UserId == userId &&
                    w.ResourceType == resourceType &&
                    accessLevelsList.Contains(w.AccessLevel))
                .ToDictionaryAsync(td => td.ResourceId, td => td.AccessLevel); // Convert results into ResourceId → AccessLevel pairs

            // Return accessible resources with their access levels
            return accessibleResources;
        }
        catch (Exception ex)
        {
            // Log failure while retrieving resource access mappings
            _logger.LogError(
                ex,
                "Failed retrieving accessible resources for User {UserId}",
                userId);

            // Return empty result on failure
            return new();
        }
    }


    // Assign creator owner permission after resource creation
    public async Task<bool> AssignOwnerAsync(
        Guid userId,
        Guid resourceId,
        ResourceTypeEnum resourceType)
    {
        try
        {
            // Create ownership mapping
            var resourceShare = new ResourceShare
            {
                UserId = userId,
                ResourceId = resourceId,
                ResourceType = resourceType,
                AccessLevel = ResourceAccessTypeEnum.Owner
            };

            // Insert access mapping
            await _unitOfWork.ResourceShareRepo.InsertAsync(resourceShare);

            // Persist owner assignment
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning(
                    "Failed assigning owner access. User {UserId}, Resource {ResourceId}",
                    userId,
                    resourceId);

                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            // Log unexpected owner assignment failure
            _logger.LogError(
                ex,
                "Unexpected error assigning owner access. Resource {ResourceId}",
                resourceId);

            return false;
        }
    }


    // Remove all resource access mappings
    // associated with a single resource
    public async Task DeleteResourceSharesAsync(
        Guid resourceId,
        ResourceTypeEnum resourceType)
    {
        try
        {
            // Retrieve resource share records
            var resourceShares = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == resourceId &&
                    w.ResourceType == resourceType)
                .ToListAsync();

            // Skip deletion if none found
            if (!resourceShares.Any())
            {
                return;
            }

            // Remove access mappings
            _unitOfWork.ResourceShareRepo.Delete(resourceShares);
        }
        catch (Exception ex)
        {
            // Log deletion failure
            _logger.LogError(
                ex,
                "Failed deleting resource shares. Resource {ResourceId}",
                resourceId);
        }
    }


    // Remove all resource access mappings associated with multiple resources
    public async Task DeleteResourceSharesAsync(
        IEnumerable<Guid> resourceIds,
        ResourceTypeEnum resourceType)
    {
        try
        {
            // Retrieve all matching resource shares
            var resourceShares = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    resourceIds.Contains(w.ResourceId) &&
                    w.ResourceType == resourceType)
                .ToListAsync();

            // Skip if no shares exist
            if (!resourceShares.Any())
            {
                return;
            }

            // Delete resource mappings
            _unitOfWork.ResourceShareRepo.Delete(resourceShares);
        }
        catch (Exception ex)
        {
            // Log bulk deletion failure
            _logger.LogError(
                ex,
                "Failed deleting resource share mappings.");
        }
    }

    // Syncs the AccountsAPIs SpaceUser table when a Space resource is shared/unshared
    // so the space membership is reflected in the Tenant Admin Users table.
    private async Task SyncSpaceUsersAsync(Guid spaceId, List<Guid> userIds, bool add)
    {
        try
        {
            var accountsApiBaseUrl = _environmentConfig.AccountsApiBaseUrl;
            if (string.IsNullOrWhiteSpace(accountsApiBaseUrl) || userIds == null || userIds.Count == 0)
                return;

            // In local development the AccountsAPIs dev certificate is untrusted, so
            // bypass SSL validation to allow the cross-API sync to succeed.
            using var httpClient = new HttpClient(new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            });
            httpClient.Timeout = TimeSpan.FromSeconds(30);
            if (!string.IsNullOrWhiteSpace(_jwt))
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _jwt);

            var url = $"{accountsApiBaseUrl.TrimEnd('/')}/api/space/{spaceId}/users";
            HttpResponseMessage response;
            if (add)
                response = await httpClient.PostAsJsonAsync(url, userIds);
            else
                response = await httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Delete, url)
                {
                    Content = JsonContent.Create(userIds)
                });

            if (!response.IsSuccessStatusCode)
                _logger.LogWarning(
                    "[SyncSpaceUsersAsync] Failed to sync space users for space {SpaceId}. Status: {Status}",
                    spaceId,
                    response.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SyncSpaceUsersAsync] Error syncing space users for space {SpaceId}.", spaceId);
        }
    }
}
