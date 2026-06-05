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

    public KnowledgeBaseService(
        ILogger<KnowledgeBaseService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IResourceShareService resourceShareService)
    {
        // Extract user ID from HttpContext
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _resourceShareService = resourceShareService;
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
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId)
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
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.Delete
                    }
                );

                // Retrieve tenant-wide or explicitly shared knowledge bases
                knowledgeBases = await _unitOfWork.KnowledgeBaseRepo
                    .GetByConditionAsync(w =>
                        w.IsTenantWideAccess ||
                        resourceAccess.Keys.Contains(w.Id))
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
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetSelectableKnowledgeBaseOptionsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
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
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

            var options = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(w =>
                    w.IsDisabled == false &&
                    (
                        w.CreatedByUserId == _userId ||
                        w.IsTenantWideAccess ||
                        accessibleKnowledgeBaseIds.Contains(w.Id)
                    )
                )
                .OrderBy(kb => kb.Name)
                .Select(kb => new SelectOptionDto
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

            // Check for duplicate name
            var existingKB = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb => kb.Name.ToLower() == normalizedName)
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

            // Check if name already exists in this tenant
            var existingKB = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb => kb.Name.ToLower() == knowledgeBaseDto.Name.ToLower())
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
                EmbeddingCredentialId = knowledgeBaseDto.EmbeddingCredentialId,
                StoreCredentialId = knowledgeBaseDto.StoreCredentialId,
                CollectionName = knowledgeBaseDto.CollectionName,
                VectorStoreConfig = knowledgeBaseDto.VectorStoreConfig,
                IsDisabled = knowledgeBaseDto.IsDisabled ?? false,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedOn = DateTimeOffset.UtcNow,
                TenantId = _currentTenantService.CurrentTenantId
            };

            await _unitOfWork.KnowledgeBaseRepo.InsertAsync(newKB);
            await _unitOfWork.SaveAsync();

            // // Assign creator as resource owner. Ensures creator receives full management permissions
            // if (!await _resourceShareService.AssignOwnerAsync(_userId, newKB.Id, ResourceTypeEnum.KnowledgeBase))
            // {
            //     _logger.LogWarning("Failed assigning owner access for KnowledgeBase {KnowledgeBaseId}", newKB.Id);
            //     return serviceResponse;
            // }

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
                .GetByConditionAsync(kb => kb.Id == knowledgeBaseDto.Id)
                .FirstOrDefaultAsync();

            if (existingKB == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Check if new name already exists for this user (exclude current KB)
            var duplicateName = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(kb =>
                    kb.Id != knowledgeBaseDto.Id &&
                    kb.Name.ToLower() == knowledgeBaseDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (duplicateName != null)
            {
                serviceResponse.Message = "A knowledge base with this name already exists";
                return serviceResponse;
            }

            // Validate update permission
            var canEdit = await _resourceShareService.HasAccessAsync(
                _userId,
                existingKB.Id,
                ResourceTypeEnum.KnowledgeBase,
                existingKB.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
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

            // Update fields
            existingKB.Name = knowledgeBaseDto.Name;
            existingKB.Description = knowledgeBaseDto.Description;
            existingKB.VectorStore = knowledgeBaseDto.VectorStore;
            existingKB.EmbeddingProvider = knowledgeBaseDto.EmbeddingProvider;
            existingKB.EmbeddingModel = knowledgeBaseDto.EmbeddingModel;
            existingKB.EmbeddingCredentialId = knowledgeBaseDto.EmbeddingCredentialId;
            existingKB.StoreCredentialId = knowledgeBaseDto.StoreCredentialId;
            existingKB.CollectionName = knowledgeBaseDto.CollectionName;
            existingKB.VectorStoreConfig = knowledgeBaseDto.VectorStoreConfig;
            existingKB.IsDisabled = knowledgeBaseDto.IsDisabled ?? false;
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
                .GetByConditionAsync(k => k.Id == id)
                .FirstOrDefaultAsync();

            if (kb == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Validate delete permission
            var canDelete = await _resourceShareService.HasAccessAsync(
                _userId,
                kb.Id,
                ResourceTypeEnum.KnowledgeBase,
                kb.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Delete,
                }
            );

            // Reject unauthorized deletion
            if (!canDelete)
            {
                _logger.LogWarning("Unauthorized KnowledgeBase deletion attempt. User {UserId}, KnowledgeBase {KnowledgeBaseId}", _userId, kb.Id);
                serviceResponse.Message = "You do not have access to delete this knowledge base.";
                return serviceResponse;
            }

            // Delete associated vector store entries (cascade delete)
            var vectorStores = await _unitOfWork.VectorStoreRepo
                .GetByConditionAsync(vs => vs.TenantId == _currentTenantService.CurrentTenantId && vs.Metadata != null)
                .ToListAsync();

            var kbVectorStores = vectorStores.Where(vs => IsVectorStoreForKnowledgeBase(vs, kb.Name)).ToList();

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
                .GetByConditionAsync(kb => requestedIds.Contains(kb.Id))
                .ToListAsync();

            if (allMatchedKBs.Count != requestedIds.Count)
            {
                serviceResponse.Message = "One or more knowledge bases were not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            var kbs = allMatchedKBs;
            // Validate delete permission for each knowledge base
            foreach (var kb in kbs)
            {
                var allowed = await _resourceShareService.HasAccessAsync(
                    _userId,
                    kb.Id,
                    ResourceTypeEnum.KnowledgeBase,
                    kb.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

                // Stop operation if at least one KB is unauthorized
                if (!allowed)
                {
                    _logger.LogWarning("Unauthorized bulk KnowledgeBase deletion. User {UserId}", _userId);
                    serviceResponse.Message = "You do not have access to delete one or more knowledge bases.";
                    return serviceResponse;
                }
            }

            // Delete associated vector store entries for all KBs
            var kbNameSet = kbs
                .Select(kb => kb.Name)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var vectorStores = await _unitOfWork.VectorStoreRepo
                .GetByConditionAsync(vs => vs.Metadata != null)
                .ToListAsync();

            var kbVectorStores = vectorStores
                .Where(vs => kbNameSet.Any(kbName => IsVectorStoreForKnowledgeBase(vs, kbName)))
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

    private static bool IsVectorStoreForKnowledgeBase(VectorStore vectorStore, string kbName)
    {
        if (vectorStore.Metadata == null)
            return false;

        if (vectorStore.Metadata.RootElement.ValueKind != JsonValueKind.Object)
            return false;

        if (!vectorStore.Metadata.RootElement.TryGetProperty("kb_name", out var kbNameElement))
            return false;

        var metadataKbName = kbNameElement.GetString();
        return !string.IsNullOrWhiteSpace(metadataKbName)
            && !string.IsNullOrWhiteSpace(kbName)
            && string.Equals(metadataKbName, kbName, StringComparison.OrdinalIgnoreCase);
    }
}
