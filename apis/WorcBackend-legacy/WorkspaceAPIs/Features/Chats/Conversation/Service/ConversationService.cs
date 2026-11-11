namespace WorkspaceAPIs.Services;

public class ConversationService : IConversationService
{
    private readonly ILogger<ConversationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly Guid _userId;

    public ConversationService(
        ILogger<ConversationService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IResourceUserAccessService resourceUserAccessService)
    {
        // Extract current user id from http context (Fallback to empty guid if not available)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _resourceUserAccessService = resourceUserAccessService;
    }

    // Retrieves active conversations for a specific flow version.
    public async Task<ServiceResponse<IEnumerable<ConversationDto>>> GetActiveConversationsAsync(Guid flowVersionId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationDto>>
        {
            Data = null,
            Message = "Failed to retrieve active conversations. Please try again."
        };

        try
        {
            // Fetch active conversations for current user and flow version
            var conversations = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.FlowVersionId == flowVersionId &&
                    w.UserId == _userId &&
                    w.Status != ConversationStatusEnum.Archived
                )
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.Messages)
                .ProjectToType<ConversationDto>()
                .ToListAsync();

            // Assign success response
            serviceResponse.Data = conversations;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Active conversations retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, "[GetActiveConversations] Failed for FlowVersionId {FlowVersionId}, UserId {UserId}", flowVersionId, _userId);
        }

        return serviceResponse;
    }

    // Retrieves archived conversations for a specific flow version.
    public async Task<ServiceResponse<IEnumerable<ConversationDto>>> GetArchivedConversationsAsync(Guid flowVersionId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationDto>>
        {
            Data = null,
            Message = "Failed to retrieve archived conversations. Please try again."
        };

        try
        {
            // Fetch archived conversations for current user and flow version
            var conversations = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.FlowVersionId == flowVersionId &&
                    w.UserId == _userId &&
                    w.Status == ConversationStatusEnum.Archived
                )
                .OrderByDescending(o => o.LastModifiedOn)
                .Include(i => i.Messages)
                .ProjectToType<ConversationDto>()
                .ToListAsync();

            // Assign success response
            serviceResponse.Data = conversations;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Archived conversations retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, "[GetArchivedConversations] Failed for FlowVersionId {FlowVersionId}, UserId {UserId}", flowVersionId, _userId);
        }

        return serviceResponse;
    }

    // Retrieves active agent-less landing conversations for the current user.
    public async Task<ServiceResponse<IEnumerable<ConversationDto>>> GetLandingActiveConversationsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationDto>>
        {
            Data = null,
            Message = "Failed to retrieve active conversations. Please try again."
        };

        try
        {
            var conversations = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.FlowVersionId == null &&
                    w.UserId == _userId &&
                    w.Status != ConversationStatusEnum.Archived
                )
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.Messages)
                .ProjectToType<ConversationDto>()
                .ToListAsync();

            serviceResponse.Data = conversations;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Active conversations retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[GetLandingActiveConversations] Failed for UserId {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Retrieves archived agent-less landing conversations for the current user.
    public async Task<ServiceResponse<IEnumerable<ConversationDto>>> GetLandingArchivedConversationsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationDto>>
        {
            Data = null,
            Message = "Failed to retrieve archived conversations. Please try again."
        };

        try
        {
            var conversations = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.FlowVersionId == null &&
                    w.UserId == _userId &&
                    w.Status == ConversationStatusEnum.Archived
                )
                .OrderByDescending(o => o.LastModifiedOn)
                .Include(i => i.Messages)
                .ProjectToType<ConversationDto>()
                .ToListAsync();

            serviceResponse.Data = conversations;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Archived conversations retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[GetLandingArchivedConversations] Failed for UserId {UserId}", _userId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<LandingConversationDto>>> GetLandingConversationsAsync(string? search, int skip, int take)
    {
        var serviceResponse = ServiceResponse<IEnumerable<LandingConversationDto>>.Create("Failed to retrieve conversations", 500);

        var query = _unitOfWork.ConversationRepo.GetByConditionAsync(w =>
            w.FlowVersionId == null &&
            w.UserId == _userId &&
            w.Status != ConversationStatusEnum.Archived &&
            w.Title != null);

        var trimmedSearch = search?.Trim();
        if (!string.IsNullOrEmpty(trimmedSearch))
        {
            var pattern = $"%{SearchByQueryHelpers.EscapeLikePattern(trimmedSearch)}%";
            query = query.Where(w => EF.Functions.ILike(w.Title!, pattern, "\\"));
        }

        var conversations = await query
            .OrderByDescending(o => o.LastModifiedOn)
            .ThenByDescending(o => o.Id)
            .Skip(Math.Max(skip, 0))
            .Take(Math.Clamp(take, 1, 100))
            .Select(s => new LandingConversationDto { Id = s.Id, Title = s.Title!, LastModifiedOn = s.LastModifiedOn })
            .ToListAsync();

        return serviceResponse.Update(null, 200, conversations);
    }

    // Retrieves a specific conversation by its unique identifier.
    public async Task<ServiceResponse<ConversationDto>> GetByIdAsync(Guid conversationId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<ConversationDto>
        {
            Data = null,
            Message = "Failed to retrieve conversation. Please try again."
        };

        try
        {
            // Fetch conversation by id and ensure ownership
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationId &&
                    w.UserId == _userId)
                .ProjectToType<ConversationDto>()
                .SingleOrDefaultAsync();

            // Validate existence
            if (conversation == null)
            {
                _logger.LogWarning(
                    "[GetConversationById] Conversation not found or access denied. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationId,
                    _userId);

                serviceResponse.Message = "Conversation not found.";
                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = conversation;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, "[GetConversationById] Failed for ConversationId {ConversationId}", conversationId);
        }

        return serviceResponse;
    }

    // Creates a new conversation.
    public async Task<ServiceResponse<ConversationDto>> CreateAsync(ConversationDto conversationDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<ConversationDto>
        {
            Data = null,
            Message = "Failed to create conversation. Please try again."
        };

        try
        {
            if (conversationDto.FlowVersionId is null)
            {
                var landingConversation = new Conversation
                {
                    UserId = _userId,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                    Status = ConversationStatusEnum.Active,
                };

                await _unitOfWork.ConversationRepo.InsertAsync(landingConversation);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError(
                        "[CreateConversation] Failed to persist landing conversation. UserId: {UserId}",
                        _userId);

                    return serviceResponse;
                }

                serviceResponse.Data = landingConversation.Adapt<ConversationDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Conversation created successfully.";
                return serviceResponse;
            }

            var flowVersionId = conversationDto.FlowVersionId.Value;

            // Validate FlowVersion exists and is accessible.
            // A flow version ID is globally unique within a tenant, so the lookup
            // is intentionally NOT scoped to the current space query filter. Access
            // is enforced separately below via IsPublished + ResourceUserAccess.
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == flowVersionId &&
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsPublished)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Validate FlowVersion existence
            if (flowVersion == null)
            {
                _logger.LogWarning(
                    "[CreateConversation] FlowVersion not found or not valid. FlowVersionId: {FlowVersionId}, UserId: {UserId}",
                    conversationDto.FlowVersionId,
                    _userId);

                serviceResponse.Message = "Flow version not found.";
                return serviceResponse;
            }

            // Validate that the current user owns the flow version, has tenant-wide access,
            // or has been explicitly granted access through ResourceUserAccess.
            var (hasAccess, _) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                flowVersion.Id,
                ResourceTypeEnum.FlowVersion,
                flowVersion.CreatedByUserId,
                flowVersion.IsTenantWideAccess,
                ResourceAccessTypeEnum.Owner,
                ResourceAccessTypeEnum.Edit,
                ResourceAccessTypeEnum.View);

            if (!hasAccess)
            {
                _logger.LogWarning(
                    "[CreateConversation] Unauthorized access attempt. FlowVersionId: {FlowVersionId}, UserId: {UserId}",
                    conversationDto.FlowVersionId,
                    _userId);

                serviceResponse.Message = "You do not have access to this agent.";
                return serviceResponse;
            }

            // Trim dto' string props
            conversationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationDto);

            // Map dto to entity
            var conversation = conversationDto.Adapt<Conversation>();

            // Assign system fields
            conversation.UserId = _userId;
            conversation.CreatedByUserId = _userId;
            conversation.LastModifiedByUserId = _userId;
            conversation.Status = ConversationStatusEnum.Active;

            // Insert new conversation
            await _unitOfWork.ConversationRepo.InsertAsync(conversation);

            // Verify persistence
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[CreateConversation] Failed to persist conversation. FlowVersionId: {FlowVersionId}, UserId: {UserId}",
                    conversationDto.FlowVersionId,
                    _userId);

                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = conversation.Adapt<ConversationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation created successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with full context
            _logger.LogError(
                ex,
                "[CreateConversation] Unexpected error. FlowVersionId: {FlowVersionId}, UserId: {UserId}",
                conversationDto?.FlowVersionId,
                _userId);
        }

        return serviceResponse;
    }

    // Updates an existing conversation.
    public async Task<ServiceResponse<ConversationDto>> UpdateAsync(ConversationDto conversationDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<ConversationDto>
        {
            Data = null,
            Message = "Failed to update conversation. Please try again."
        };

        try
        {
            // Fetch existing conversation
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationDto.Id &&
                    w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Validate existence
            if (conversation == null)
            {
                serviceResponse.Message = "Conversation not found.";
                return serviceResponse;
            }

            // Trim dto' string props
            conversationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationDto);

            // Map updated fields
            conversationDto.Adapt(conversation);

            // Update entity
            _unitOfWork.ConversationRepo.Update(conversation);

            // Verify persistence
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("[UpdateConversation] Failed for Id {ConversationId}", conversationDto.Id);
                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = conversation.Adapt<ConversationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[UpdateConversation] Error for Id {ConversationId}", conversationDto.Id);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> UpdateLandingConversationTitleAsync(UpdateConversationTitleDto updateConversationTitleDto)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to rename conversation", 500);

        var title = updateConversationTitleDto.Title.Trim();
        if (title.Length == 0)
            return serviceResponse.Update("Title is required", 400);

        var updated = await _unitOfWork.ConversationRepo
            .GetByConditionAsync(w =>
                w.Id == updateConversationTitleDto.Id &&
                w.FlowVersionId == null &&
                w.UserId == _userId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(c => c.Title, title));

        return updated == 0
            ? serviceResponse.Update("Conversation not found", 404)
            : serviceResponse.Update(null, 200, true);
    }

    // Archives a conversation.
    public async Task<ServiceResponse<bool>> ArchiveAsync(Guid conversationId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to archive conversation. Please try again."
        };

        try
        {
            // Fetch conversation
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == conversationId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Validate existence
            if (conversation == null)
            {
                _logger.LogWarning(
                    "[ArchiveConversation] Conversation not found or access denied. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationId,
                    _userId);

                serviceResponse.Message = "Conversation not found.";
                return serviceResponse;
            }

            // Prevent redundant archive operation
            if (conversation.Status == ConversationStatusEnum.Archived)
            {
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Conversation is already archived.";
                return serviceResponse;
            }

            // Update status and archive metadata
            conversation.Status = ConversationStatusEnum.Archived;
            conversation.LastModifiedOn = DateTimeOffset.UtcNow;
            conversation.LastModifiedByUserId = _userId;

            _unitOfWork.ConversationRepo.Update(conversation);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[ArchiveConversation] Failed to persist changes. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationId,
                    _userId);

                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation archived successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[ArchiveConversation] Unexpected error. ConversationId: {ConversationId}, UserId: {UserId}",
                conversationId,
                _userId);
        }

        return serviceResponse;
    }

    // Unarchives a conversation.
    public async Task<ServiceResponse<bool>> UnarchiveAsync(Guid conversationId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to unarchive conversation. Please try again."
        };

        try
        {
            // Fetch conversation
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == conversationId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Validate existence
            if (conversation == null)
            {
                _logger.LogWarning(
                    "[UnarchiveConversation] Conversation not found or access denied. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationId,
                    _userId);

                serviceResponse.Message = "Conversation not found.";
                return serviceResponse;
            }

            // Prevent redundant unarchive operation
            if (conversation.Status == ConversationStatusEnum.Active)
            {
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Conversation is already active.";
                return serviceResponse;
            }

            // Update status and reset archive metadata
            conversation.Status = ConversationStatusEnum.Active;
            conversation.LastModifiedByUserId = _userId;
            conversation.LastModifiedOn = DateTimeOffset.UtcNow; ;

            _unitOfWork.ConversationRepo.Update(conversation);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[UnarchiveConversation] Failed to persist changes. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationId,
                    _userId);

                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation unarchived successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[UnarchiveConversation] Unexpected error. ConversationId: {ConversationId}, UserId: {UserId}",
                conversationId,
                _userId);
        }

        return serviceResponse;
    }

    // Archives multiple conversations.
    public async Task<ServiceResponse<bool>> ArchiveBulkAsync(IEnumerable<Guid> conversationIds)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to archive conversations. Please try again."
        };

        try
        {
            // Validate input
            if (conversationIds == null || !conversationIds.Any())
            {
                _logger.LogWarning("[ArchiveBulk] Empty or null conversationIds received. UserId: {UserId}", _userId);
                serviceResponse.Message = "No conversation ids provided.";
                return serviceResponse;
            }

            // Fetch conversations for current user
            var conversations = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => conversationIds.Contains(w.Id) && w.UserId == _userId)
                .ToListAsync();

            // Validate existence
            if (!conversations.Any())
            {
                _logger.LogWarning(
                    "[ArchiveBulk] No matching conversations found. UserId: {UserId}, RequestedCount: {Count}",
                    _userId,
                    conversationIds.Count());

                serviceResponse.Message = "No conversations found.";
                return serviceResponse;
            }

            // Filter only non-archived conversations (idempotency)
            var conversationsToArchive = conversations
                .Where(w => w.Status != ConversationStatusEnum.Archived)
                .ToList();

            if (!conversationsToArchive.Any())
            {
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "All conversations are already archived.";
                return serviceResponse;
            }

            // Update status and archive metadata
            conversationsToArchive.ForEach(c =>
            {
                c.Status = ConversationStatusEnum.Archived;
                c.LastModifiedByUserId = _userId;
                c.LastModifiedOn = DateTimeOffset.UtcNow;
            });

            _unitOfWork.ConversationRepo.Update(conversationsToArchive);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[ArchiveBulk] Failed to persist changes. UserId: {UserId}, Count: {Count}",
                    _userId,
                    conversationsToArchive.Count);

                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{conversationsToArchive.Count} conversations archived successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[ArchiveBulk] Unexpected error. UserId: {UserId}, RequestedCount: {Count}",
                _userId,
                conversationIds?.Count());
        }

        return serviceResponse;
    }

    // Deletes a conversation.
    public async Task<ServiceResponse<bool>> DeleteAsync(Guid conversationId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete conversation."
        };

        try
        {
            // Fetch conversation
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == conversationId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Validate existence
            if (conversation == null)
            {
                _logger.LogWarning(
                    "[DeleteConversation] Conversation not found or access denied. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationId,
                    _userId);

                serviceResponse.Message = "Conversation not found.";
                return serviceResponse;
            }

            // Delete entity
            _unitOfWork.ConversationRepo.Delete(conversation);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[DeleteConversation] Failed to persist delete. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationId,
                    _userId);

                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[DeleteConversation] Unexpected error. ConversationId: {ConversationId}, UserId: {UserId}",
                conversationId,
                _userId);
        }

        return serviceResponse;
    }

    // Deletes multiple conversations.
    public async Task<ServiceResponse<bool>> DeleteBulkAsync(IEnumerable<Guid> conversationIds)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete conversations. Please try again."
        };

        try
        {
            // Validate input
            if (conversationIds == null || !conversationIds.Any())
            {
                _logger.LogWarning("[DeleteBulkConversation] Empty or null input received. UserId: {UserId}", _userId);
                serviceResponse.Message = "No conversation ids provided.";
                return serviceResponse;
            }

            // Fetch conversations
            var conversations = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => conversationIds.Contains(w.Id) && w.UserId == _userId)
                .ToListAsync();

            // Validate existence
            if (!conversations.Any())
            {
                _logger.LogWarning(
                    "[DeleteBulkConversation] No matching conversations found. UserId: {UserId}, RequestedCount: {Count}",
                    _userId,
                    conversationIds.Count());

                serviceResponse.Message = "No conversations found.";
                return serviceResponse;
            }

            // Delete entities
            _unitOfWork.ConversationRepo.Delete(conversations);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[DeleteBulkConversation] Failed to persist delete. UserId: {UserId}, Count: {Count}",
                    _userId,
                    conversations.Count);

                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{conversations.Count} conversations deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[DeleteBulkConversation] Unexpected error. UserId: {UserId}, RequestedCount: {Count}",
                _userId,
                conversationIds?.Count());
        }

        return serviceResponse;
    }
}