namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing Knowledge Bases.
/// Handles CRUD operations and business logic for knowledge base management.
/// </summary>
public class KnowledgeBaseService : IKnowledgeBaseService
{
    private readonly ILogger<KnowledgeBaseService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceShareService _resourceShareService;
    private readonly IUserManagementGuardService _userManagementGuardService;

    public KnowledgeBaseService(
        ILogger<KnowledgeBaseService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IResourceShareService resourceShareService,
        IUserManagementGuardService userManagementGuardService)
    {
        // Extract user ID from HttpContext
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _resourceShareService = resourceShareService;
        _userManagementGuardService = userManagementGuardService;
    }

    /// <summary>
    /// Retrieves all knowledge bases for the current tenant.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<KnowledgeBaseDto>>> GetKnowledgeBasesAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<KnowledgeBaseDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            List<KnowledgeBase> knowledgeBases = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            // Return only knowledge bases created by current user
            if (isPersonal)
            {
                knowledgeBases = await _unitOfWork.KnowledgeBaseRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.Files)
                    .ToListAsync();
            }
            else
            {
                // Retrieve accessible knowledge base IDs with permissions
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.KnowledgeBase,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve tenant-wide or explicitly shared knowledge bases
                knowledgeBases = await _unitOfWork.KnowledgeBaseRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id)
                        )
                    )
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.Files)
                    .ToListAsync();
            }

            // Map to DTOs
            var knowledgeBaseDtoList = knowledgeBases.Adapt<List<KnowledgeBaseDto>>();

            // Assign access levels:
            // - Personal knowledge bases are always owned by the current user.
            // - Shared/tenant-wide knowledge bases use granted permissions,
            //   defaulting to View when no explicit permission exists..
            knowledgeBaseDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            serviceResponse.Data = knowledgeBaseDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Knowledge bases retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving knowledge bases for user {UserId}", _userId);
            serviceResponse.Message = "Failed to retrieve knowledge bases. Please try again";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Retrieves tenant-wide knowledge bases in select-option format.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableKnowledgeBaseOptionsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to retrieve knowledge base options. Please try again"
        };

        try
        {
            // Retrieve knowledge base IDs accessible to current user
            var accessibleKnowledgeBaseIds = await _resourceShareService
                .GetAccessibleResourceIdsAsync(
                    _userId,
                    ResourceTypeEnum.KnowledgeBase,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

            var options = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(w =>
                    w.IsDisabled == false &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    (
                        w.CreatedByUserId == _userId ||
                        w.IsTenantWideAccess ||
                        accessibleKnowledgeBaseIds.Contains(w.Id)
                    )
                )
                .OrderBy(kb => kb.Name)
                .Select(kb => new SelectOption
                {
                    Value = kb.Name, // Use Name as Value for select options since KBs are tenant-wide and Name is unique within a tenant
                    Label = kb.Name,
                    Description = kb.Description,
                })
                .ToListAsync();

            serviceResponse.Data = options;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Knowledge base options retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving knowledge base options for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Checks if a knowledge base name is available within the current tenant.
    /// </summary>
    public async Task<ServiceResponse<TrueFalseResultDto>> IsKnowledgeBaseNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check knowledge base name availability. Please try again"
        };

        try
        {
            if (string.IsNullOrWhiteSpace(checkAvailabilityDto.UserInput))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "Knowledge base name is required";
                return serviceResponse;
            }

            var normalizedName = checkAvailabilityDto.UserInput.Trim().ToLower();

            // Check for duplicate name within the current environment
            var existingKB = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb =>
                    kb.TenantId == _currentTenantService.CurrentTenantId &&
                    kb.Name.ToLower() == normalizedName &&
                    kb.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            var isAvailable = existingKB == null;

            serviceResponse.Data = new TrueFalseResultDto { Result = isAvailable };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = isAvailable
                ? "Knowledge base name is available"
                : "Knowledge base name is already in use";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking knowledge base name availability for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Retrieves a knowledge base by its name if the current user has access.
    /// </summary>
    public async Task<ServiceResponse<KnowledgeBaseDto>> GetKnowledgeBaseByNameAsync(string knowledgeBaseName)
    {
        var serviceResponse = new ServiceResponse<KnowledgeBaseDto>
        {
            Data = null,
            StatusCode = 404,
            Message = "Failed to retrieve knowledge base. Please try again."
        };

        try
        {
            if (string.IsNullOrWhiteSpace(knowledgeBaseName))
            {
                serviceResponse.Message = "Knowledge base name is required.";
                return serviceResponse;
            }

            // Retrieve the knowledge base by name within the current environment.
            var knowledgeBase = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb =>
                    kb.Name.ToLower() == knowledgeBaseName.ToLower() &&
                    kb.EnvType == _currentTenantService.CurrentEnvType)
                .Include(kb => kb.CreatedByUser)
                .Include(kb => kb.LastModifiedByUser)
                .Include(kb => kb.Files)
                .FirstOrDefaultAsync();

            // Return if no matching knowledge base exists.
            if (knowledgeBase == null)
            {
                serviceResponse.Message = "Knowledge base not found.";
                return serviceResponse;
            }

            // Verify that the current user has permission to view the knowledge base.
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                knowledgeBase.Id,
                ResourceTypeEnum.KnowledgeBase,
                knowledgeBase.CreatedByUserId,
                knowledgeBase.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.View,
                });

            // Block users without view access.
            if (!canView)
            {
                _logger.LogWarning(
                    "User {UserId} attempted to access KnowledgeBase {KnowledgeBaseId} without permission.",
                    _userId,
                    knowledgeBase.Id);

                serviceResponse.Message = "You do not have permission to view this knowledge base.";
                return serviceResponse;
            }

            // Map entity to DTO and populate the user's access level.
            var knowledgeBaseDto = knowledgeBase.Adapt<KnowledgeBaseDto>();
            knowledgeBaseDto.AccessLevel = accessLevel ?? ResourceAccessTypeEnum.View;

            serviceResponse.Data = knowledgeBaseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Knowledge base retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving knowledge base '{KnowledgeBaseName}' for user {UserId}.",
                knowledgeBaseName,
                _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Inserts a new knowledge base.
    /// </summary>
    public async Task<ServiceResponse<KnowledgeBaseDto>> InsertKnowledgeBaseAsync(KnowledgeBaseDto knowledgeBaseDto)
    {
        var serviceResponse = new ServiceResponse<KnowledgeBaseDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Block creating new knowledge bases while in the PROD environment.
            var prodBlock = CreateResourceGuard.Validate<KnowledgeBaseDto>(
                _currentTenantService.CurrentEnvType,
                "knowledge base");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            knowledgeBaseDto = TrimDtoStringPropsUtil.TrimDtoStringProps(knowledgeBaseDto);

            // Validate input
            if (string.IsNullOrWhiteSpace(knowledgeBaseDto.Name))
            {
                serviceResponse.Message = "Knowledge base name is required";
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(knowledgeBaseDto.EmbeddingProvider))
            {
                serviceResponse.Message = "Embedding provider is required";
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(knowledgeBaseDto.EmbeddingModel))
            {
                serviceResponse.Message = "Embedding model is required";
                return serviceResponse;
            }

            // Check if name already exists in this tenant within the current environment
            var existingKB = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb =>
                    kb.TenantId == _currentTenantService.CurrentTenantId &&
                    kb.Name.ToLower() == knowledgeBaseDto.Name.ToLower() &&
                    kb.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (existingKB != null)
            {
                serviceResponse.Message = "A knowledge base with this name already exists";
                return serviceResponse;
            }

            // Create new entity
            var newKB = new KnowledgeBase
            {
                Id = Guid.NewGuid(),
                Name = knowledgeBaseDto.Name,
                Description = knowledgeBaseDto.Description,
                VectorStore = knowledgeBaseDto.VectorStore,
                EmbeddingProvider = knowledgeBaseDto.EmbeddingProvider,
                EmbeddingModel = knowledgeBaseDto.EmbeddingModel,
                EmbeddingCredentialId = await ResolveCredentialIdAsync(knowledgeBaseDto.EmbeddingCredentialName, knowledgeBaseDto.EmbeddingCredentialId),
                StoreCredentialId = knowledgeBaseDto.StoreCredentialId,
                CollectionName = knowledgeBaseDto.CollectionName,
                VectorStoreConfig = knowledgeBaseDto.VectorStoreConfig,
                IsDisabled = knowledgeBaseDto.IsDisabled ?? false,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedOn = DateTimeOffset.UtcNow,
                TenantId = _currentTenantService.CurrentTenantId,
                EnvType = _currentTenantService.CurrentEnvType
            };

            await _unitOfWork.KnowledgeBaseRepo.InsertAsync(newKB);
            await _unitOfWork.SaveAsync();

            // Assign creator as resource owner. Ensures creator receives full management permissions
            if (!await _resourceShareService.AssignOwnerAsync(_userId, newKB.Id, ResourceTypeEnum.KnowledgeBase))
            {
                _logger.LogWarning("Failed assigning owner access for KnowledgeBase {KnowledgeBaseId}", newKB.Id);
                return serviceResponse;
            }

            // Map back to DTO for response
            var resultDto = newKB.Adapt<KnowledgeBaseDto>();
            var createdByUser = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(u => u.Id == _userId)
                .FirstOrDefaultAsync();
            resultDto.CreatedBy = createdByUser?.UserName;

            serviceResponse.Data = resultDto;
            serviceResponse.StatusCode = 201;
            serviceResponse.Message = "Knowledge base created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inserting knowledge base for user {UserId}", _userId);
            serviceResponse.Message = "Failed to create knowledge base. Please try again";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Updates an existing knowledge base.
    /// </summary>
    public async Task<ServiceResponse<KnowledgeBaseDto>> UpdateKnowledgeBaseAsync(KnowledgeBaseDto knowledgeBaseDto)
    {
        var serviceResponse = new ServiceResponse<KnowledgeBaseDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            knowledgeBaseDto = TrimDtoStringPropsUtil.TrimDtoStringProps(knowledgeBaseDto);

            // Validate input
            if (knowledgeBaseDto.Id == Guid.Empty)
            {
                serviceResponse.Message = "Knowledge base ID is required";
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(knowledgeBaseDto.Name))
            {
                serviceResponse.Message = "Knowledge base name is required";
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(knowledgeBaseDto.EmbeddingProvider))
            {
                serviceResponse.Message = "Embedding provider is required";
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(knowledgeBaseDto.EmbeddingModel))
            {
                serviceResponse.Message = "Embedding model is required";
                return serviceResponse;
            }

            // Get existing knowledge base
            var existingKB = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb =>
                    string.IsNullOrEmpty(knowledgeBaseDto.Name)
                        ? kb.Id == knowledgeBaseDto.Id
                        : kb.Name.ToLower() == knowledgeBaseDto.Name.ToLower() && kb.EnvType == _currentTenantService.CurrentEnvType
                )
                .FirstOrDefaultAsync();

            if (existingKB == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Require OM for PROD edits based on the persisted knowledge base environment.
            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<KnowledgeBaseDto>(
                existingKB.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "knowledge base");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            // Check if new name already exists for this user (exclude current KB)
            var duplicateName = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb =>
                    kb.Id != knowledgeBaseDto.Id &&
                    kb.Name.ToLower() == knowledgeBaseDto.Name.ToLower() &&
                    kb.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            if (duplicateName != null)
            {
                serviceResponse.Message = "A knowledge base with this name already exists";
                return serviceResponse;
            }

            // Validate update permission
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                existingKB.Id,
                ResourceTypeEnum.KnowledgeBase,
                existingKB.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Block unauthorized update
            if (!canEdit)
            {
                _logger.LogWarning("User {UserId} attempted unauthorized KnowledgeBase update {KnowledgeBaseId}", _userId, existingKB.Id);
                serviceResponse.Message = "You do not have access to update this knowledge base.";
                return serviceResponse;
            }

            // Check and update Description if the value has changed
            if (existingKB.Description != knowledgeBaseDto.Description)
            {
                existingKB.Description = knowledgeBaseDto.Description;
            }

            // Check and update Vector Store if the value has changed
            if (existingKB.VectorStore != knowledgeBaseDto.VectorStore)
            {
                existingKB.VectorStore = knowledgeBaseDto.VectorStore;
            }

            // Check and update Embedding Provider if the value has changed
            if (existingKB.EmbeddingProvider != knowledgeBaseDto.EmbeddingProvider)
            {
                existingKB.EmbeddingProvider = knowledgeBaseDto.EmbeddingProvider;
            }

            // Check and update Embedding Model if the value has changed
            if (existingKB.EmbeddingModel != knowledgeBaseDto.EmbeddingModel)
            {
                existingKB.EmbeddingModel = knowledgeBaseDto.EmbeddingModel;
            }

            // Check and update Embedding Credential ID if the value has changed
            if (!string.IsNullOrWhiteSpace(knowledgeBaseDto.EmbeddingCredentialName))
            {
                knowledgeBaseDto.EmbeddingCredentialId = await ResolveCredentialIdAsync(knowledgeBaseDto.EmbeddingCredentialName, knowledgeBaseDto.EmbeddingCredentialId);
            }

            if (existingKB.EmbeddingCredentialId != knowledgeBaseDto.EmbeddingCredentialId)
            {
                existingKB.EmbeddingCredentialId = knowledgeBaseDto.EmbeddingCredentialId;
            }

            // Check and update Store Credential ID if the value has changed
            if (existingKB.StoreCredentialId != knowledgeBaseDto.StoreCredentialId)
            {
                existingKB.StoreCredentialId = knowledgeBaseDto.StoreCredentialId;
            }

            // Check and update Collection Name if the value has changed
            if (existingKB.CollectionName != knowledgeBaseDto.CollectionName)
            {
                existingKB.CollectionName = knowledgeBaseDto.CollectionName;
            }

            // Check and update Vector Store Configuration if the value has changed
            if (existingKB.VectorStoreConfig != knowledgeBaseDto.VectorStoreConfig)
            {
                existingKB.VectorStoreConfig = knowledgeBaseDto.VectorStoreConfig;
            }

            // Check and update Disabled status if the value has changed
            if (knowledgeBaseDto.IsDisabled.HasValue && existingKB.IsDisabled != knowledgeBaseDto.IsDisabled)
            {
                existingKB.IsDisabled = knowledgeBaseDto.IsDisabled.Value;
            }

            // Update audit fields after processing updates
            existingKB.LastModifiedByUserId = _userId;
            existingKB.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.KnowledgeBaseRepo.Update(existingKB);
            await _unitOfWork.SaveAsync();

            // Map back to DTO for response
            var resultDto = existingKB.Adapt<KnowledgeBaseDto>();
            var lastModifiedUser = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(u => u.Id == existingKB.LastModifiedByUserId)
                .FirstOrDefaultAsync();
            resultDto.LastModifiedBy = lastModifiedUser?.UserName;

            serviceResponse.Data = resultDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Knowledge base updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating knowledge base for user {UserId}", _userId);
            serviceResponse.Message = "Failed to update knowledge base. Please try again";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Deletes a knowledge base and its associated vector store entries.
    /// </summary>
    public async Task<ServiceResponse<bool>> DeleteKnowledgeBaseAsync(Guid id)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            // Get the knowledge base
            var kb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(k => k.Id == id && k.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            if (kb == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD KBs or KBs with a same-name PROD twin.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.KnowledgeBaseRepo,
                kb.EnvType,
                kb.Name,
                w => w.Name.ToLower() == kb.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == kb.TenantId &&
                     w.SpaceId == kb.SpaceId,
                "knowledge base");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Validate delete permission
            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                kb.Id,
                ResourceTypeEnum.KnowledgeBase,
                kb.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            // Reject unauthorized deletion
            if (!canDelete)
            {
                _logger.LogWarning("Unauthorized KnowledgeBase deletion attempt. User {UserId}, KnowledgeBase {KnowledgeBaseId}", _userId, kb.Id);
                serviceResponse.Message = "You do not have access to delete this knowledge base.";
                return serviceResponse;
            }

            // Delete associated vector store entries (cascade delete), scoped to the KB's own
            // environment so deleting a Dev KB never removes its Production vectors.
            var vectorStores = await _unitOfWork.VectorStoreRepo
                .GetByConditionAsync(vs => vs.TenantId == _currentTenantService.CurrentTenantId && vs.Metadata != null)
                .ToListAsync();

            var kbEnvType = kb.EnvType.ToString().ToLowerInvariant();
            var kbVectorStores = vectorStores
                .Where(vs => VectorStoreMetadataHelpers.IsForKnowledgeBase(vs, kb.Name) &&
                             string.Equals(VectorStoreMetadataHelpers.GetEnvType(vs), kbEnvType, StringComparison.OrdinalIgnoreCase))
                .ToList();

            foreach (var vs in kbVectorStores)
            {
                _unitOfWork.VectorStoreRepo.Delete(vs);
            }

            // Remove all resource sharing mappings. Prevent orphan permission records
            await _resourceShareService.DeleteResourceSharesAsync(kb.Id, ResourceTypeEnum.KnowledgeBase);

            // Delete the knowledge base
            _unitOfWork.KnowledgeBaseRepo.Delete(kb);
            await _unitOfWork.SaveAsync();

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Knowledge base deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting knowledge base {Id} for user {UserId}", id, _userId);
            serviceResponse.Message = "Failed to delete knowledge base. Please try again";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Deletes multiple knowledge bases by their IDs.
    /// </summary>
    public async Task<ServiceResponse<bool>> DeleteKnowledgeBasesAsync(List<Guid> ids)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            if (ids == null || ids.Count == 0)
            {
                serviceResponse.Message = "No knowledge bases specified for deletion";
                return serviceResponse;
            }

            var requestedIds = ids
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            if (requestedIds.Count == 0)
            {
                serviceResponse.Message = "No valid knowledge base IDs were provided";
                return serviceResponse;
            }

            var allMatchedKBs = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb => requestedIds.Contains(kb.Id) && kb.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            if (allMatchedKBs.Count != requestedIds.Count)
            {
                serviceResponse.Message = "One or more knowledge bases were not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            var kbs = allMatchedKBs;
            // Validate delete permission + PROD-guard for each knowledge base
            var blockedNames = new List<string>();
            foreach (var kb in kbs)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    kb.Id,
                    ResourceTypeEnum.KnowledgeBase,
                    kb.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                    }
                );

                // Stop operation if at least one KB is unauthorized
                if (!canDelete)
                {
                    _logger.LogWarning("Unauthorized bulk KnowledgeBase deletion. User {UserId}", _userId);
                    serviceResponse.Message = "You do not have access to delete one or more knowledge bases.";
                    return serviceResponse;
                }

                // PROD-guard: block the whole batch if any KB is PROD or has a same-name PROD twin.
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.KnowledgeBaseRepo,
                    kb.EnvType,
                    kb.Name,
                    w => w.Name.ToLower() == kb.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == kb.TenantId &&
                         w.SpaceId == kb.SpaceId,
                    "knowledge base");
                if (guardBlock != null)
                {
                    blockedNames.Add(kb.Name);
                }
            }

            // Reject the entire batch when any selected KB is protected by the PROD guard.
            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following knowledge base(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            // Delete associated vector store entries for all KBs, scoped by each KB's environment.
            var kbScopes = kbs
                .Where(kb => !string.IsNullOrWhiteSpace(kb.Name))
                .Select(kb => (Name: kb.Name, EnvType: kb.EnvType.ToString().ToLowerInvariant()))
                .ToHashSet();
            var vectorStores = await _unitOfWork.VectorStoreRepo
                .GetByConditionAsync(vs => vs.Metadata != null)
                .ToListAsync();

            var kbVectorStores = vectorStores
                .Where(vs => kbScopes.Any(scope =>
                    VectorStoreMetadataHelpers.IsForKnowledgeBase(vs, scope.Name) &&
                    string.Equals(VectorStoreMetadataHelpers.GetEnvType(vs), scope.EnvType, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            foreach (var vs in kbVectorStores)
            {
                _unitOfWork.VectorStoreRepo.Delete(vs);
            }

            foreach (var kb in kbs)
            {
                _unitOfWork.KnowledgeBaseRepo.Delete(kb);
            }

            await _unitOfWork.SaveAsync();

            // Remove resource access mappings. Prevent orphan permission records
            await _resourceShareService.DeleteResourceSharesAsync(ids, ResourceTypeEnum.KnowledgeBase);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{kbs.Count} knowledge base(s) deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting multiple knowledge bases for user {UserId}", _userId);
            serviceResponse.Message = "Failed to delete knowledge bases. Please try again";
        }

        return serviceResponse;
    }

    // Resolves a credential NAME to its entity ID. If a name is supplied it takes precedence;
    // otherwise the explicitly provided ID is returned unchanged.
    private async Task<Guid?> ResolveCredentialIdAsync(string? credentialName, Guid? existingCredentialId)
    {
        if (string.IsNullOrWhiteSpace(credentialName))
            return existingCredentialId;

        var credential = await _unitOfWork.AppSecretRepo
            .GetByConditionAsync(w => w.Name == credentialName && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();

        return credential?.Id ?? existingCredentialId;
    }
}
