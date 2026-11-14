namespace WorkspaceAPIs.Services;

public class ConversationService : IConversationService
{
    private readonly ILogger<ConversationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly string _accessToken;

    public ConversationService(
        ILogger<ConversationService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IResourceUserAccessService resourceUserAccessService,
        EnvironmentConfig environmentConfig)
    {
        // Extract current user id from http context (Fallback to empty guid if not available)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _resourceUserAccessService = resourceUserAccessService;
        _environmentConfig = environmentConfig;
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
            // Validate FlowVersion exists and is accessible.
            // A flow version ID is globally unique within a tenant, so the lookup
            // is intentionally NOT scoped to the current space query filter. Access
            // is enforced separately below via IsPublished + ResourceUserAccess.
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationDto.FlowVersionId &&
                    (w.Flow.Type == FlowTypesEnum.ChatAgent || w.Flow.Type == FlowTypesEnum.VoiceAgent) &&
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

            // Best-effort transcript webhook delivery; never changes the archive result.
            await TriggerTranscriptWebhookAsync(conversation);
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

    // Delivers the archived conversation transcript to the VoiceAgent's configured
    // transcript webhook. Best-effort: failures are logged and never change the archive result.
    private async Task TriggerTranscriptWebhookAsync(Conversation conversation)
    {
        try
        {
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(f => f.Id == conversation.FlowVersionId)
                .Include(f => f.Flow)
                .FirstOrDefaultAsync();

            if (flowVersion?.Flow?.Type != FlowTypesEnum.VoiceAgent)
                return;

            if (!VoiceAgentGraphHelpers.IsTranscriptWebhookEnabled(flowVersion.ReactFlowObject))
                return;

            var webhookUrl = VoiceAgentGraphHelpers.GetTranscriptWebhookUrl(flowVersion.ReactFlowObject);
            if (string.IsNullOrWhiteSpace(webhookUrl))
                return;

            var endpoint = $"{_environmentConfig.LlmPipelineApiBaseUrl}/api/chat/conversations/{conversation.Id}/transcript-webhook";
            var jsonContent = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(new { webhook_url = webhookUrl }),
                Encoding.UTF8,
                "application/json");

            using var httpClient = new HttpClient(new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
            });

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
            httpClient.Timeout = TimeSpan.FromSeconds(20);

            using var response = await httpClient.PostAsync(endpoint, jsonContent);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "[ArchiveConversation] Transcript webhook dispatch returned {StatusCode}. ConversationId: {ConversationId}",
                    response.StatusCode,
                    conversation.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "[ArchiveConversation] Transcript webhook dispatch failed. ConversationId: {ConversationId}",
                conversation.Id);
        }
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
                .Where(w => w.Status == ConversationStatusEnum.Archived)
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