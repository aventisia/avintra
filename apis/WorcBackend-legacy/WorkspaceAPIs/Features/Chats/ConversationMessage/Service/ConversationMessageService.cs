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
    public async Task<ServiceResponse<ConversationMessageDto>> SendMessageAsync(ConversationMessageRequestDto conversationMessageRequestDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<ConversationMessageDto>
        {
            Data = null,
            Message = "Unable to send message. Please try again."
        };

        try
        {
            // Validate input
            if (conversationMessageRequestDto == null ||
                string.IsNullOrWhiteSpace(conversationMessageRequestDto.Content))
            {
                _logger.LogWarning(
                    "[SendMessage] Invalid request payload. UserId: {UserId}", _userId);

                serviceResponse.Message = "Invalid message request.";
                return serviceResponse;
            }

            // Fetch conversation ensuring it belongs to current user
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationMessageRequestDto.ConversationId &&
                    w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Handle missing or unauthorized conversation
            if (conversation == null)
            {
                _logger.LogWarning(
                    "[SendMessage] Conversation not found or access denied. ConversationId: {ConversationId}, UserId: {UserId}",
                    conversationMessageRequestDto.ConversationId,
                    _userId);

                // NOTE: Could auto-create conversation here if required
                serviceResponse.Message = "Conversation not found.";
                return serviceResponse;
            }

            // Trim dto' string props
            conversationMessageRequestDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationMessageRequestDto);

            // Create new message entity
            var message = new ConversationMessage
            {
                ConversationId = conversation.Id,
                Content = conversationMessageRequestDto.Content,
                Role = ConversationMessageTypes.User,
                CreatedOn = DateTimeOffset.UtcNow
            };

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

            // TODO: Integrate LLM response generation here
            // Steps:
            // 1. Fetch recent conversation messages
            // 2. Send to LLM provider (OpenAI/Azure/etc.)
            // 3. Receive/stream response
            // 4. Save assistant message with metadata (tokens, model, etc.)

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
                conversationMessageRequestDto?.ConversationId);
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
                .OrderByDescending(o => o.CreatedOn)
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
    public async Task<ServiceResponse<IEnumerable<ConversationMessageDto>>> SearchMessagesAsync(string query)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationMessageDto>>
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
                .ProjectToType<ConversationMessageDto>()
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