namespace WorkspaceAPIs.Services;

public class AdminConversationService : IAdminConversationService
{
    private readonly ILogger<AdminConversationService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public AdminConversationService(
        ILogger<AdminConversationService> logger,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves conversations (active or archived) for admin view based on date filters.
    public async Task<ServiceResponse<IEnumerable<AdminConversationDto>>> GetAdminConversationsAsync(ConversationFilterDto conversationFilterDto)
    {
        // Default response in case of failure
        var serviceResponse = new ServiceResponse<IEnumerable<AdminConversationDto>>
        {
            Data = null,
            Message = "Unable to retrieve conversations at this time."
        };

        try
        {
            // Apply default range (last 7 days) if no dates are provided
            if (!conversationFilterDto.StartDate.HasValue || !conversationFilterDto.EndDate.HasValue)
            {
                conversationFilterDto.StartDate = DateTimeOffset.UtcNow.AddDays(-6);
                conversationFilterDto.EndDate = DateTimeOffset.UtcNow;
            }

            // Resolve conversation status based on archive flag
            var status = conversationFilterDto.IsArchived
                ? ConversationStatusEnum.Archived
                : ConversationStatusEnum.Active;

            // Fetch conversations with related entities within the date range
            var conversations = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w =>
                    w.Status == status &&
                    w.CreatedOn.Date >= conversationFilterDto.StartDate.Value.Date &&
                    w.CreatedOn.Date <= conversationFilterDto.EndDate.Value.Date &&

                    // User and FlowVersion filter (optional)
                    (conversationFilterDto.UserIds == null || !conversationFilterDto.UserIds.Any() || conversationFilterDto.UserIds.Contains(w.UserId)) &&
                    (conversationFilterDto.FlowVersionIds == null || !conversationFilterDto.FlowVersionIds.Any() || conversationFilterDto.FlowVersionIds.Contains(w.FlowVersionId))
                )
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.Messages)
                .Include(i => i.User)
                .Include(i => i.FlowVersion)
                    .ThenInclude(fv => fv.Flow)
                .ToListAsync();

            serviceResponse.Data = conversations.Adapt<List<AdminConversationDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversations retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[GetAdminConversations] Error while retrieving conversations. Archived: {IsArchived}, StartDate: {StartDate}, EndDate: {EndDate}",
                conversationFilterDto.IsArchived,
                conversationFilterDto.StartDate,
                conversationFilterDto.EndDate);
        }

        return serviceResponse;
    }

    // Retrieves all messages for a specific conversation ordered chronologically.
    public async Task<ServiceResponse<IEnumerable<ConversationMessageDto>>> GetMessagesByConversationIdAsync(Guid conversationId)
    {
        // Default response in case of failure
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationMessageDto>>
        {
            Data = null,
            Message = "Unable to retrieve conversation messages."
        };

        try
        {
            // Fetch messages for the given conversation
            var messages = await _unitOfWork.ConversationMessageRepo
                .GetByConditionAsync(w => w.ConversationId == conversationId)
                .OrderBy(m => m.CreatedOn)
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
                "[GetMessagesByConversationId] Failed to retrieve messages for ConversationId: {ConversationId}",
                conversationId);
        }

        return serviceResponse;
    }
}