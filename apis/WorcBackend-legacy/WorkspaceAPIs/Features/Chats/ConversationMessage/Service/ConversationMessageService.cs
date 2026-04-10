namespace WorkspaceAPIs.Services;

public class ConversationMessageService : IConversationMessageService
{
    private readonly ILogger<ConversationMessageService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ConversationMessageService(
        ILogger<ConversationMessageService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract current user ID from HTTP context claims
        // Fallback to empty GUID if not available (prevents null issues)
        _userId = Guid.Parse(
            httpContextAccessor.HttpContext?.User?.FindFirstValue("uid")
            ?? Guid.Empty.ToString()
        );

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Sends a message in an existing conversation.
    public async Task<ServiceResponse<ConversationMessageDto>> SendMessageAsync(ConversationMessageDto conversationMessageDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<ConversationMessageDto>
        {
            Data = null,
            Message = "Failed to send message. Please try again."
        };

        try
        {
            // Validate input
            if (conversationMessageDto == null || string.IsNullOrWhiteSpace(conversationMessageDto.Content))
            {
                _logger.LogWarning(
                    "[SendMessage] Invalid request payload. UserId: {UserId}", _userId);

                serviceResponse.Message = "Invalid message request.";
                return serviceResponse;
            }

            // Validate required identifiers
            if (conversationMessageDto.FlowVersionId == Guid.Empty || conversationMessageDto.ConversationId == Guid.Empty)
            {
                _logger.LogWarning(
                    "[SendMessage] Invalid FlowVersionId or ConversationId. UserId: {UserId}",
                    _userId);

                serviceResponse.Message = "Invalid request. FlowVersionId or ConversationId is invalid.";
                return serviceResponse;
            }

            // Validate FlowVersion exists and is accessible
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationMessageDto.FlowVersionId &&
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsPublished &&
                    w.FlowVersionUsers!.Any(a => a.UserId == _userId)
                )
                .Include(w => w.FlowVersionUsers)
                .SingleOrDefaultAsync();

            // Validate FlowVersion existence
            if (flowVersion == null)
            {
                _logger.LogWarning(
                    "[CreateConversation] FlowVersion not found or not valid. FlowVersionId: {FlowVersionId}, UserId: {UserId}",
                    conversationMessageDto.FlowVersionId,
                    _userId);

                serviceResponse.Message = "Invalid or inaccessible flow version.";
                return serviceResponse;
            }

            // Fetch conversation ensuring it belongs to the current user
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationMessageDto.ConversationId &&
                    w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Check if ConversationId is empty or default
            var isNewConversationRequest =
                conversationMessageDto.ConversationId == Guid.Empty;

            // CASE 1: Create new conversation (no ID provided)
            if (isNewConversationRequest && conversation == null)
            {
                _logger.LogInformation(
                    "[SendMessage] No ConversationId provided. Creating new conversation. UserId: {UserId}",
                    _userId);

                conversation = new Conversation
                {
                    FlowVersionId = conversationMessageDto.FlowVersionId,
                    Status = ConversationStatusEnum.Active,
                    UserId = _userId,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };

                await _unitOfWork.ConversationRepo.InsertAsync(conversation);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("[SendMessage] Failed to create conversation. UserId: {UserId}", _userId);

                    return serviceResponse;
                }

                // Assign new conversation ID back to DTO
                conversationMessageDto.ConversationId = conversation.Id;
            }

            // CASE 2: ConversationId provided but not found → invalid
            if (!isNewConversationRequest && conversation == null)
            {
                _logger.LogWarning(
                    "[SendMessage] Invalid ConversationId. Conversation not found. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationMessageDto.ConversationId,
                    _userId);

                serviceResponse.Message = "Invalid conversation. Please verify the ConversationId and try again.";
                return serviceResponse;
            }

            // Trim all string properties in the DTO (e.g., remove leading/trailing spaces)
            conversationMessageDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationMessageDto);

            // Create new message entity
            var message = conversationMessageDto.Adapt<ConversationMessage>();

            // Insert message into repository
            await _unitOfWork.ConversationMessageRepo.InsertAsync(message);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "[SendMessage] Failed to persist message. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversation.Id,
                    _userId);

                return serviceResponse;
            }

            // TODO: Integrate external web API response generation here
            // Steps:
            // 1. Fetch recent conversation messages
            // 2. Prepare request payload (conversation + messages)
            // 3. Send HTTP request to external service endpoint
            // 4. Receive/stream response from API
            // 5. Save assistant message with metadata (response info, status, etc.)

            // Map entity to DTO and return success
            serviceResponse.Data = message.Adapt<ConversationMessageDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Message sent successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[SendMessage] Unexpected error occurred. UserId: {UserId}, ConversationId: {ConversationId}",
                _userId,
                conversationMessageDto?.ConversationId);
        }

        return serviceResponse;
    }

    // Retrieves all messages for a given conversation.
    public async Task<ServiceResponse<IEnumerable<ConversationMessageDto>>> GetMessagesAsync(Guid conversationId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationMessageDto>>
        {
            Data = null,
            Message = "Failed to retrieve messages. Please try again."
        };

        try
        {
            // Fetch messages belonging to the conversation and user
            var messages = await _unitOfWork.ConversationMessageRepo
                .GetByConditionAsync(w =>
                    w.ConversationId == conversationId &&
                    w.Conversation.UserId == _userId)
                .OrderBy(o => o.CreatedOn)
                .ProjectToType<ConversationMessageDto>()
                .ToListAsync();

            serviceResponse.Data = messages;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Messages retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[GetMessages] Failed for ConversationId {ConversationId}",
                conversationId);
        }

        return serviceResponse;
    }

    // Retrieves the most recent messages for LLM context.
    public async Task<ServiceResponse<IEnumerable<ConversationMessageDto>>> GetRecentMessagesAsync(Guid conversationId, int count)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationMessageDto>>
        {
            Data = null,
            Message = "Failed to retrieve recent messages. Please try again."
        };

        try
        {
            // Fetch latest messages in descending order
            var messages = await _unitOfWork.ConversationMessageRepo
                .GetByConditionAsync(w =>
                    w.ConversationId == conversationId &&
                    w.Conversation.UserId == _userId)
                .OrderByDescending(o => o.CreatedOn)
                .Take(count)
                .ProjectToType<ConversationMessageDto>()
                .ToListAsync();

            serviceResponse.Data = messages;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Recent messages retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[GetRecentMessages] Failed for ConversationId {ConversationId}",
                conversationId);
        }

        return serviceResponse;
    }

    // Searches messages across all user conversations.
    public async Task<ServiceResponse<IEnumerable<SearchConversationMessageDto>>> SearchMessagesAsync(string query)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<SearchConversationMessageDto>>
        {
            Data = null,
            Message = "Failed to search messages. Please try again."
        };

        try
        {
            // Validate search query
            if (string.IsNullOrWhiteSpace(query))
            {
                _logger.LogWarning(
                    "[SearchMessages] Empty query received. UserId: {UserId}",
                    _userId);

                serviceResponse.Message = "Search query is required.";
                return serviceResponse;
            }

            // Perform search (simple LIKE match)
            var messages = await _unitOfWork.ConversationMessageRepo
                .GetByConditionAsync(w =>
                    w.Conversation.UserId == _userId &&
                    w.Content.Contains(query))
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.Conversation)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .ProjectToType<SearchConversationMessageDto>()
                .ToListAsync();

            serviceResponse.Data = messages;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Search results retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[SearchMessages] Failed. Query: {Query}, UserId: {UserId}",
                query,
                _userId);
        }

        return serviceResponse;
    }
}