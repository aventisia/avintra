namespace WorkspaceAPIs.Services;

public class NotificationHistoryService : INotificationHistoryService
{
    private readonly ILogger<NotificationHistoryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public NotificationHistoryService(
        ILogger<NotificationHistoryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of notification history rows for the current user, with optional filters.
    public async Task<ServiceResponse<NotificationHistoryListDto>> GetHistoryAsync(
        NotificationTypesEnum? type = null,
        NotificationSourceEnum? sourceType = null,
        bool? isRead = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<NotificationHistoryListDto>.Create("Failed to retrieve notification history", 400);

        try
        {
            // Base query scoped to the current user.
            // Only surface notifications that have actually been dispatched (Status = Sent).
            // Scheduled notifications must NOT appear in history until their due time has
            // arrived (the dispatch job flips them to Sent at the configured schedule time).
            IQueryable<NotificationUser> query = _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => w.UserId == _userId &&
                                          w.Notification != null &&
                                          w.Notification.Status == NotificationStatusEnum.Sent &&
                                          w.Notification.DeliveryChannel != DeliveryChannelEnum.Email)
                .Include(i => i.Notification);

            // Apply optional filters
            if (type.HasValue)
                query = query.Where(w => w.Notification.Type == type.Value);

            if (sourceType.HasValue)
                query = query.Where(w => w.Notification.SourceType == sourceType.Value);

            if (isRead.HasValue)
                query = query.Where(w => w.IsRead == isRead.Value);

            // Apply the start date filter inclusively.
            // Include all notifications created on or after the selected start date.
            if (from.HasValue)
            {
                query = query.Where(w => w.Notification.CreatedOn >= from.Value);
            }

            // The frontend sends the end date at midnight (00:00).
            // Move to the start of the following day and use a strict less-than comparison
            // to include all notifications created throughout the selected end date.
            if (to.HasValue)
            {
                var exclusiveTo = to.Value.AddDays(1);
                query = query.Where(w => w.Notification.CreatedOn < exclusiveTo);
            }

            // Get the list, newest first
            var items = await query
                .OrderByDescending(w => w.Notification.CreatedOn)
                .ProjectToType<NotificationHistoryDto>()
                .ToListAsync();

            // Task successful
            serviceResponse.Update("Notification history retrieved successfully", 200, new NotificationHistoryListDto
            {
                Items = items
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notification history");
        }

        return serviceResponse;
    }
}
