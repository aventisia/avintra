namespace WorkspaceAPIs.Services;

public class UnreadNotificationService : IUnreadNotificationService
{
    private readonly ILogger<UnreadNotificationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public UnreadNotificationService(
        ILogger<UnreadNotificationService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of unread notifications asynchronously.
    public async Task<ServiceResponse<IEnumerable<UnreadNotificationDto>>> GetUnreadNotificationsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<UnreadNotificationDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get notifications.
            // Only surface notifications that have actually been dispatched (Status = Sent).
            // Scheduled notifications must NOT appear in the bell until their due time has
            // arrived (the dispatch job flips them to Sent at the configured schedule time).
            // Email-only notifications (DeliveryChannel = Email) must NOT appear in the bell;
            // only Platform and Both channels are shown in the in-app bell.
            var unreadNotifications = await _unitOfWork.NotificationUserRepo
                                        .GetByConditionAsync(w => !w.IsRead &&
                                                                  w.UserId == _userId &&
                                                                  w.Notification != null &&
                                                                  w.Notification.Status == NotificationStatusEnum.Sent &&
                                                                  w.Notification.DeliveryChannel != DeliveryChannelEnum.Email)
                                        .OrderByDescending(o => o.Notification.CreatedOn) // Newest unread first
                                        .ProjectToType<UnreadNotificationDto>()
                                        .ToListAsync();

            // Task successful
            serviceResponse.Data = unreadNotifications;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Unread notifications retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Marks a notification as read asynchronously.
    public async Task<ServiceResponse<bool>> MarkNotificationAsReadAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to mark notification as read. Please try again later.",
        };

        try
        {
            // Validate notification existence
            var unreadNotification = await _unitOfWork.NotificationUserRepo
                                        .GetByConditionAsync(w =>
                                            w.NotificationId == id &&
                                            w.UserId == _userId)
                                        .SingleOrDefaultAsync();

            // Notification does not exist
            if (unreadNotification == null)
            {
                serviceResponse.Message = "Notification does not exist";
                return serviceResponse;
            }

            // Mark as read
            unreadNotification.IsRead = true;

            // Update notification
            _unitOfWork.NotificationUserRepo.Update(unreadNotification);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notification marked as read successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}
