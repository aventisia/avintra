namespace WorkspaceAPIs.Services;

public class AutoNotificationService : IAutoNotificationService
{
    private readonly ILogger<AutoNotificationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationHelperService _notificationHelperService;
    private readonly Guid _userId;

    public AutoNotificationService(
        ILogger<AutoNotificationService> logger,
        IUnitOfWork unitOfWork,
        INotificationHelperService notificationHelperService,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _notificationHelperService = notificationHelperService;

        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Insert system generated notification
    public async Task<bool> InsertAutoNotificationAsync(AutoNotificationDto autoNotificationDto)
    {
        try
        {
            // User list is empty
            if (autoNotificationDto.UserIdList.Count == 0)
            {
                return false;
            }

            // Trim dto' string props
            autoNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(autoNotificationDto);

            // Default mapping
            var newNotification = autoNotificationDto.Adapt<Notification>();
            newNotification.Id = Guid.NewGuid();
            newNotification.CreatedByUserId = _userId;
            newNotification.LastModifiedByUserId = _userId;

            // Additional Mapping
            newNotification.IsSystemGenerated = true; // DO NOT set it to false

            // Insert auto notification
            await _unitOfWork.NotificationRepo.InsertAsync(newNotification);

            // Insert NotificationUser relationship
            if (!await _notificationHelperService.AddNotificationUsers(newNotification.Id, autoNotificationDto.UserIdList))
            {
                return false;
            }

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }

        return true;
    }

    // Update system generated notification using ref Id
    public async Task<bool> UpdateAutoNotificationAsync(AutoNotificationDto autoNotificationDto)
    {
        try
        {
            // Validate auto notification existence
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.RefId == autoNotificationDto.RefId && w.IsSystemGenerated)
                .SingleOrDefaultAsync();

            // Auto notification does not exist
            if (notification == null)
            {
                return false;
            }

            // Trim dto' string props
            autoNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(autoNotificationDto);

            // Default mapping
            autoNotificationDto.Adapt(notification);
            notification.LastModifiedByUserId = _userId;
            notification.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update auto notification
            _unitOfWork.NotificationRepo.Update(notification);

            // Update NotificationUser relationship
            if (!await _notificationHelperService.UpdateNotificationUsers(notification.Id, autoNotificationDto.UserIdList))
            {
                return false;
            }

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }

        return true;
    }

    // Delete system generated notification using ref Id
    public async Task<bool> DeleteAutoNotificationAsync(Guid refId)
    {
        try
        {
            // Validate auto notification existence
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.RefId == refId && w.IsSystemGenerated)
                .SingleOrDefaultAsync();

            // Auto notification does not exist
            if (notification == null)
            {
                return false;
            }

            // TODO: Check relationship with other entities

            // Get M2M NotificationUser relationship records to delete
            var notificationUsers = await _unitOfWork.NotificationUserRepo
                                        .GetByConditionAsync(w => w.NotificationId == notification.Id)
                                        .ToListAsync();

            // Delete M2M relationship of NotificationUser
            _unitOfWork.NotificationUserRepo.Delete(notificationUsers);

            // Delete auto notification
            _unitOfWork.NotificationRepo.Delete(notification);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }

        return true;
    }
}
