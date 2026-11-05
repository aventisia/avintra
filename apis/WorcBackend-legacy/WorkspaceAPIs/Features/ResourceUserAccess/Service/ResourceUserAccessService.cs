namespace WorkspaceAPIs.Services;

public class ResourceUserAccessService : IResourceUserAccessService
{
    private readonly ILogger<ResourceUserAccessService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly string? _jwt;

    public ResourceUserAccessService(
        ILogger<ResourceUserAccessService> logger,
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

    // Retrieves all resource user access records assigned to the current user, optionally filtered by resource type.
    public async Task<ServiceResponse<IEnumerable<ResourceUserAccessDto>>> GetMyResourceUserAccessesAsync(ResourceTypeEnum? resourceType)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<IEnumerable<ResourceUserAccessDto>>
        {
            Data = null,
            Message = "Failed to retrieve shared resources. Please try again."
        };

        try
        {
            // Build query to fetch resource user access records for the current user.
            var resourceUserAccessesQuery = _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.UserId == _userId &&
                    (!resourceType.HasValue || w.ResourceType == resourceType)
                );

            // Include user details and map to DTO.
            serviceResponse.Data = await resourceUserAccessesQuery
                .Include(i => i.User)
                .ProjectToType<ResourceUserAccessDto>()
                .ToListAsync();

            // Prepare successful response.
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Shared resources retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[GetMyResourceUserAccessesAsync] Failed to retrieve resources for UserId {UserId}",
                _userId);
        }

        return serviceResponse;
    }

    // Retrieves all users who have been granted access to a specific resource.
    public async Task<ServiceResponse<IEnumerable<ResourceUserAccessDto>>> GetResourceUserAccessesAsync(Guid resourceId, ResourceTypeEnum? resourceType = null)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<IEnumerable<ResourceUserAccessDto>>
        {
            Data = null,
            Message = "Failed to retrieve resource shares. Please try again."
        };

        try
        {
            // Fetch all resource user access records for the given resource and include user details.
            var resourceUserAccesses = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == resourceId &&
                    (!resourceType.HasValue || w.ResourceType == resourceType.Value))
                .Include(i => i.User)
                .ProjectToType<ResourceUserAccessDto>()
                .ToListAsync();

            // Populate response with retrieved data.
            serviceResponse.Data = resourceUserAccesses;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource shares retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors for diagnostics.
            _logger.LogError(
                ex,
                "[GetResourceUserAccessesAsync] Failed to retrieve resource shares for ResourceId {ResourceId}",
                resourceId);
        }

        return serviceResponse;
    }

    // Retrieves a specific resource user access by its identifier.
    public async Task<ServiceResponse<ResourceUserAccessDto>> GetResourceUserAccessByIdAsync(Guid resourceUserAccessId)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<ResourceUserAccessDto>
        {
            Data = null,
            Message = "Failed to retrieve resource share. Please try again."
        };

        try
        {
            // Fetch the resource user access including recipient details.
            var resourceUserAccess = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w => w.Id == resourceUserAccessId)
                .Include(i => i.User)
                .ProjectToType<ResourceUserAccessDto>()
                .SingleOrDefaultAsync();

            if (resourceUserAccess == null)
            {
                // Log that the resource user access was not found.
                _logger.LogWarning(
                    "[GetResourceUserAccessByIdAsync] Resource share not found for Id {Id}",
                    resourceUserAccessId);

                serviceResponse.Message = "Resource share not found.";
                return serviceResponse;
            }
            // Populate response.
            serviceResponse.Data = resourceUserAccess;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource share retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[GetResourceUserAccessByIdAsync] Failed to retrieve resource share for Id {Id}",
                resourceUserAccessId);
        }

        return serviceResponse;
    }

    // Creates a new resource user access and grants access to a specified user.
    public async Task<ServiceResponse<ResourceUserAccessDto>> CreateResourceUserAccessAsync(ResourceUserAccessDto resourceUserAccessDto)
    {
        // Initialize response with a default failure state.
        var serviceResponse = new ServiceResponse<ResourceUserAccessDto>
        {
            Data = null,
            Message = "Failed to add resource access. Please try again."
        };

        try
        {
            // Block sharing a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceUserAccessGuard.ValidateAsync<ResourceUserAccessDto>(
                _unitOfWork,
                resourceUserAccessDto.ResourceType,
                resourceUserAccessDto.ResourceId,
                "share");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            if (resourceUserAccessDto.UserId != Guid.Empty && resourceUserAccessDto.UserId == _userId)
            {
                return serviceResponse.Update("You cannot share a resource with yourself.", 400);
            }

            // Check if the user already has access to this resource.
            var existingResource = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == resourceUserAccessDto.ResourceId &&
                    w.ResourceType == resourceUserAccessDto.ResourceType &&
                    w.UserId == resourceUserAccessDto.UserId)
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
                .GetByConditionAsync(w => w.Id == resourceUserAccessDto.UserId)
                .SingleOrDefaultAsync();

            if (workspaceUser == null)
            {
                serviceResponse.Message = "The specified user does not exist.";
                return serviceResponse;
            }

            // Map DTO to entity for database insertion.
            var resourceUserAccess = resourceUserAccessDto.Adapt<ResourceUserAccess>();
            resourceUserAccess.TenantId = _currentTenantService.CurrentTenantId;

            // Insert the new resource user access record.
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(resourceUserAccess);

            // Persist changes and verify success.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning(
                    "[CreateResourceUserAccessAsync] Failed to persist resource share for ResourceId {ResourceId} and UserId {UserId}",
                    resourceUserAccessDto.ResourceId,
                    resourceUserAccessDto.UserId);
                return serviceResponse;
            }

            // Map persisted entity back to DTO for response.
            serviceResponse.Data = resourceUserAccess.Adapt<ResourceUserAccessDto>();

            // Set successful response details.
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource access granted successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected exceptions for debugging.
            _logger.LogError(
                ex,
                "[CreateResourceUserAccessAsync] Failed for ResourceId {ResourceId}",
                resourceUserAccessDto.ResourceId);
        }

        return serviceResponse;
    }

    // Creates resource user access records and grants access to multiple users for the specified resource.
    public async Task<ServiceResponse<bool>> CreateBulkResourceUserAccessAsync(CreateResourceUserAccessDto createResourceUserAccessDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to add resource access. Please try again."
        };

        try
        {
            // Block sharing a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceUserAccessGuard.ValidateAsync<bool>(
                _unitOfWork,
                createResourceUserAccessDto.ResourceType,
                createResourceUserAccessDto.ResourceId,
                "share");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            var selfUsers = createResourceUserAccessDto.Users
                .Where(s => s.UserId != Guid.Empty && s.UserId == _userId)
                .ToList();

            var shareableUsers = createResourceUserAccessDto.Users
                .Where(s => s.UserId == Guid.Empty || s.UserId != _userId)
                .ToList();

            if (selfUsers.Count > 0 && shareableUsers.Count == 0)
            {
                return serviceResponse.Update("You cannot share a resource with yourself.", 400);
            }

            var userIds = shareableUsers
                .Select(s => s.UserId)
                .Distinct()
                .ToList();

            // Get existing shares in one query.
            var existingShares = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == createResourceUserAccessDto.ResourceId &&
                    w.ResourceType == createResourceUserAccessDto.ResourceType &&
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
            var resourceUserAccesses = shareableUsers
                .Where(w => validUserIds.Contains(w.UserId) && !existingUserIds.Contains(w.UserId))
                .Select(s => new ResourceUserAccess
                {
                    ResourceId = createResourceUserAccessDto.ResourceId,
                    ResourceType = createResourceUserAccessDto.ResourceType,
                    UserId = s.UserId,
                    AccessLevel = s.AccessLevel,
                    TenantId = _currentTenantService.CurrentTenantId
                })
                .ToList();

            if (!resourceUserAccesses.Any())
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "No valid users found or access already exists.";
                return serviceResponse;
            }

            // Bulk insert.
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(resourceUserAccesses);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning(
                    "[CreateBulkResourceUserAccessAsync] Failed for ResourceId {ResourceId}",
                    createResourceUserAccessDto.ResourceId);

                return serviceResponse;
            }

            // For Space resources, sync the AccountsAPIs SpaceUser table so the
            // space membership is reflected in the Tenant Admin Users table.
            if (createResourceUserAccessDto.ResourceType == ResourceTypeEnum.Space)
            {
                await SyncSpaceUsersAsync(
                    createResourceUserAccessDto.ResourceId,
                    resourceUserAccesses.Select(s => s.UserId).ToList(),
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
                "[CreateBulkResourceUserAccessAsync] Failed for ResourceId {ResourceId}",
                createResourceUserAccessDto.ResourceId);
        }

        return serviceResponse;
    }

    // Updates an existing resource user access.
    public async Task<ServiceResponse<ResourceUserAccessDto>> UpdateResourceUserAccessAsync(ResourceUserAccessDto resourceUserAccessDto)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<ResourceUserAccessDto>
        {
            Data = null,
            Message = "Failed to update resource share. Please try again."
        };

        try
        {
            // Retrieve the existing resource user access.
            var resourceUserAccess = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w => w.Id == resourceUserAccessDto.Id)
                .SingleOrDefaultAsync();

            // Return if the resource user access does not exist.
            if (resourceUserAccess == null)
            {
                _logger.LogWarning(
                    "[UpdateResourceUserAccessAsync] Resource share not found for Id {Id}",
                    resourceUserAccessDto.Id);

                serviceResponse.Message = "Resource share not found.";
                return serviceResponse;
            }

            // Block sharing a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceUserAccessGuard.ValidateAsync<ResourceUserAccessDto>(
                _unitOfWork,
                resourceUserAccess.ResourceType,
                resourceUserAccess.ResourceId,
                "change sharing for");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            if (resourceUserAccessDto.UserId != Guid.Empty &&
                resourceUserAccessDto.UserId == _userId &&
                resourceUserAccess.UserId != _userId)
            {
                return serviceResponse.Update("You cannot share a resource with yourself.", 400);
            }

            // Map updated DTO values to the entity.
            resourceUserAccessDto.Adapt(resourceUserAccess);

            // Update the entity in the repository.
            _unitOfWork.ResourceUserAccessRepo.Update(resourceUserAccess);

            // Persist changes.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning(
                    "[UpdateResourceUserAccessAsync] Failed to persist changes for Id {Id}",
                    resourceUserAccessDto.Id);

                return serviceResponse;
            }

            // Map updated entity back to DTO for response.
            serviceResponse.Data = resourceUserAccess.Adapt<ResourceUserAccessDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Resource share updated successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors.
            _logger.LogError(
                ex,
                "[UpdateResourceUserAccessAsync] Unexpected error while updating resource share for Id {Id}",
                resourceUserAccessDto.Id);
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
            var prodShareBlock = await ProdResourceUserAccessGuard.ValidateAsync<bool>(
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

                case ResourceTypeEnum.ConfigStore:
                    {
                        // Retrieve the ConfigStore resource.
                        var configStore = await _unitOfWork.ConfigStoreRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (configStore == null)
                            return serviceResponse;

                        configStore.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.ConfigStoreRepo.Update(configStore);
                        break;
                    }

                case ResourceTypeEnum.VaultCredential:
                    {
                        // Retrieve the VaultCredential resource.
                        var vaultCredential = await _unitOfWork.VaultCredentialRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (vaultCredential == null)
                            return serviceResponse;

                        vaultCredential.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.VaultCredentialRepo.Update(vaultCredential);
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

                case ResourceTypeEnum.UiBuilder:
                    {
                        // Retrieve the UiBuilderProject resource.
                        var uiBuilderProject = await _unitOfWork.UiBuilderProjectRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (uiBuilderProject == null)
                            return serviceResponse;

                        uiBuilderProject.IsTenantWideAccess = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.UiBuilderProjectRepo.Update(uiBuilderProject);
                        break;
                    }

                case ResourceTypeEnum.UiBuilderPublished:
                    {
                        // Retrieve the UiBuilderProject resource.
                        var uiBuilderProject = await _unitOfWork.UiBuilderProjectRepo
                            .GetByConditionAsync(w => w.Id == updateTenantWideAccessDto.ResourceId)
                            .SingleOrDefaultAsync();

                        if (uiBuilderProject == null)
                            return serviceResponse;

                        uiBuilderProject.IsPublishedTenantWide = updateTenantWideAccessDto.IsTenantWideAccess;
                        _unitOfWork.UiBuilderProjectRepo.Update(uiBuilderProject);
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

            // Retrieve the user's resource user access for the specified resource.
            var resourceUserAccess = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == resourceId &&
                    w.UserId == _userId)
                .FirstOrDefaultAsync();

            // Validate that the resource user access exists.
            if (resourceUserAccess == null)
            {
                serviceResponse.Message = "Access record not found.";
                return serviceResponse;
            }

            // Block removing access from a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceUserAccessGuard.ValidateAsync<bool>(
                _unitOfWork,
                resourceUserAccess.ResourceType,
                resourceUserAccess.ResourceId,
                "remove access from");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            // Remove the user's access record.
            _unitOfWork.ResourceUserAccessRepo.Delete(resourceUserAccess);

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

    // Deletes a single resource user access by its unique identifier.
    public async Task<ServiceResponse<bool>> DeleteResourceUserAccessAsync(Guid resourceUserAccessId)
    {
        // Initialize response with default failure state.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove resource access. Please try again."
        };

        try
        {
            // Retrieve the resource user access entity by its ID.
            var resourceUserAccess = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w => w.Id == resourceUserAccessId)
                .SingleOrDefaultAsync();

            // Validate that the resource user access exists.
            if (resourceUserAccess == null)
            {
                serviceResponse.Message = "Resource share not found.";
                return serviceResponse;
            }

            // Block removing access from a published (PROD) Configure resource.
            var prodShareBlock = await ProdResourceUserAccessGuard.ValidateAsync<bool>(
                _unitOfWork,
                resourceUserAccess.ResourceType,
                resourceUserAccess.ResourceId,
                "remove access from");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            // Mark the entity for deletion.
            _unitOfWork.ResourceUserAccessRepo.Delete(resourceUserAccess);

            // Persist changes to the database and check for success.
            if (!await _unitOfWork.SaveAsync())
            {
                // Log failure if SaveAsync did not succeed.
                _logger.LogError(
                    "[DeleteResourceUserAccessAsync] Failed to persist deletion for resource share Id {Id}",
                    resourceUserAccessId);
                return serviceResponse;
            }

            // For Space resources, sync the AccountsAPIs SpaceUser table so the
            // space membership is reflected in the Tenant Admin Users table.
            if (resourceUserAccess.ResourceType == ResourceTypeEnum.Space)
            {
                await SyncSpaceUsersAsync(
                    resourceUserAccess.ResourceId,
                    new List<Guid> { resourceUserAccess.UserId },
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
                "[DeleteResourceUserAccessAsync] Exception occurred while deleting resource share Id {Id}",
                resourceUserAccessId);
        }

        return serviceResponse;
    }

    // Deletes multiple resource user access records by their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteResourceUserAccessesAsync(IEnumerable<Guid> resourceUserAccessIds)
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
            if (resourceUserAccessIds == null || !resourceUserAccessIds.Any())
            {
                serviceResponse.Message = "No resource share IDs were provided for deletion.";
                return serviceResponse;
            }

            // Retrieve all resource user access records matching the provided IDs.
            var resourceUserAccesses = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w => resourceUserAccessIds.Contains(w.Id))
                .ToListAsync();

            // Validate that matching resource user access records were found.
            if (!resourceUserAccesses.Any())
            {
                serviceResponse.Message = "No matching resource shares were found.";
                return serviceResponse;
            }

            // Block removing access from published (PROD) resources in a batched check.
            var prodShareBlock = await ProdResourceUserAccessGuard.ValidateManyAsync<bool>(
                _unitOfWork,
                resourceUserAccesses.Select(resourceUserAccess => (resourceUserAccess.ResourceType, resourceUserAccess.ResourceId)),
                "remove access from");
            if (prodShareBlock != null)
            {
                return prodShareBlock;
            }

            // Mark all retrieved resource user access records for deletion.
            _unitOfWork.ResourceUserAccessRepo.Delete(resourceUserAccesses);

            // Persist changes to the database and verify success.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[DeleteResourceUserAccessesAsync] Failed to persist deletion for resource share IDs: {Ids}",
                    string.Join(", ", resourceUserAccessIds));

                return serviceResponse;
            }

            // Prepare successful response.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{resourceUserAccesses.Count} resource share(s) removed successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected exceptions for diagnostics.
            _logger.LogError(
                ex,
                "[DeleteResourceUserAccessesAsync] Exception occurred while deleting resource shares: {Ids}",
                string.Join(", ", resourceUserAccessIds));
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
            var access = await _unitOfWork.ResourceUserAccessRepo
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

            // Retrieve resource user access mappings matching requested access levels
            var resourceUserAccessIds = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.UserId == userId &&
                    w.ResourceType == resourceType &&
                    accessLevelsList.Contains(w.AccessLevel))
                .Select(s => s.ResourceId)
                .ToListAsync();

            // Return accessible resource ids
            return resourceUserAccessIds;
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

            // Query resource user access mappings for the user and requested access levels
            var accessibleResources = await _unitOfWork.ResourceUserAccessRepo
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
            var tenantId = _currentTenantService.CurrentTenantId;

            // IMPORTANT NOTE: Owner rows created before tenant scoping was applied can have an empty tenant id, so ignore the filter to repair them instead of inserting a duplicate.
            var existingAccess = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.UserId == userId &&
                    w.ResourceId == resourceId &&
                    w.ResourceType == resourceType)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (existingAccess == null)
            {
                await _unitOfWork.ResourceUserAccessRepo.InsertAsync(new ResourceUserAccess
                {
                    UserId = userId,
                    ResourceId = resourceId,
                    ResourceType = resourceType,
                    AccessLevel = ResourceAccessTypeEnum.Owner,
                    TenantId = tenantId
                });
            }
            else if (existingAccess.TenantId != tenantId ||
                     existingAccess.AccessLevel != ResourceAccessTypeEnum.Owner)
            {
                existingAccess.TenantId = tenantId;
                existingAccess.AccessLevel = ResourceAccessTypeEnum.Owner;
                _unitOfWork.ResourceUserAccessRepo.Update(existingAccess);
            }

            // SaveAsync(true) treats an already-correct owner row as success.
            if (!await _unitOfWork.SaveAsync(true))
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
    public async Task DeleteResourceUserAccessesAsync(
        Guid resourceId,
        ResourceTypeEnum resourceType)
    {
        try
        {
            // Retrieve resource user access records
            var resourceUserAccesses = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.ResourceId == resourceId &&
                    w.ResourceType == resourceType)
                .ToListAsync();

            // Skip deletion if none found
            if (!resourceUserAccesses.Any())
            {
                return;
            }

            // Remove access mappings
            _unitOfWork.ResourceUserAccessRepo.Delete(resourceUserAccesses);
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
    public async Task DeleteResourceUserAccessesAsync(
        IEnumerable<Guid> resourceIds,
        ResourceTypeEnum resourceType)
    {
        try
        {
            // Retrieve all matching resource user access records
            var resourceUserAccesses = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    resourceIds.Contains(w.ResourceId) &&
                    w.ResourceType == resourceType)
                .ToListAsync();

            // Skip if no shares exist
            if (!resourceUserAccesses.Any())
            {
                return;
            }

            // Delete resource mappings
            _unitOfWork.ResourceUserAccessRepo.Delete(resourceUserAccesses);
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
