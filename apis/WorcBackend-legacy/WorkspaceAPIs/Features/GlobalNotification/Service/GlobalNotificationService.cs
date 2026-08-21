namespace WorkspaceAPIs.Services;

public class GlobalNotificationService : IGlobalNotificationService
{
    private readonly ILogger<GlobalNotificationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationHelperService _notificationHelperService;
    private readonly Guid _userId;

    public GlobalNotificationService(
        ILogger<GlobalNotificationService> logger,
        IUnitOfWork unitOfWork,
        INotificationHelperService notificationHelperService,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _notificationHelperService = notificationHelperService;
    }

    // Retrieves a global notification by its ID.
    public async Task<ServiceResponse<GlobalNotificationDto>> GetGlobalNotificationAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<GlobalNotificationDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get notification
            var notification = await _unitOfWork.NotificationRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == id &&
                                            !w.IsSystemGenerated)
                                        .SingleOrDefaultAsync();

            // Notification doesn't exist
            if (notification == null)
            {
                serviceResponse.Message = "Notification does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = notification.Adapt<GlobalNotificationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notification retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves list of global notifications.
    public async Task<ServiceResponse<IEnumerable<GlobalNotificationDto>>> GetGlobalNotificationsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<GlobalNotificationDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get notifications 
            var notifications = await _unitOfWork.NotificationRepo
                                        .GetByConditionAsync(w => !w.IsSystemGenerated) //PEDNING: Update condition
                                        .ToListAsync();

            // Task successful
            serviceResponse.Data = notifications.Adapt<IEnumerable<GlobalNotificationDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notifications retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new global notification.
    public async Task<ServiceResponse<GlobalNotificationDto>> InsertGlobalNotificationAsync(GlobalNotificationDto globalNotificationDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<GlobalNotificationDto>
        {
            Data = null,
            Message = "Failed to insert notification. Please try again"
        };

        try
        {
            // Get all userIds
            var userIds = await _unitOfWork.WorkspaceUserRepo.GetAllAsync().Select(s => s.Id).ToListAsync();

            // Trim dto' string props
            globalNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(globalNotificationDto);

            // Default mapping
            var newNotification = globalNotificationDto.Adapt<Notification>();
            newNotification.Id = Guid.NewGuid();
            newNotification.CreatedByUserId = _userId;
            newNotification.LastModifiedByUserId = _userId;

            // Additional Mapping
            newNotification.IsSystemGenerated = false; // DO NOT set it to true

            // Insert notification
            await _unitOfWork.NotificationRepo.InsertAsync(newNotification);

            // Insert NotificationUser relationship
            if (!await _notificationHelperService.AddNotificationUsers(newNotification.Id, userIds))
            {
                return serviceResponse;
            }

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newNotification.Adapt<GlobalNotificationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notification created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing global notification. This operation is only allowed within 10 minutes of creation.
    public async Task<ServiceResponse<GlobalNotificationDto>> UpdateGlobalNotificationAsync(GlobalNotificationDto globalNotificationDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<GlobalNotificationDto>
        {
            Data = null,
            Message = "Failed to update notification. Please try again"
        };

        try
        {
            // Validate notification existence
            var notification = await _unitOfWork.NotificationRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == globalNotificationDto.Id &&
                                            !w.IsSystemGenerated)
                                        .SingleOrDefaultAsync();

            // Notification does not exist
            if (notification == null)
            {
                serviceResponse.Message = "Notification does not exist";
                return serviceResponse;
            }

            // Notification is older than 10 minutes
            if (notification.CreatedOn.AddMinutes(10) < DateTimeOffset.UtcNow)
            {
                serviceResponse.Message = "Notification is older than 10 minutes and cannot be updated";
                return serviceResponse;
            }

            // Trim dto' string props
            globalNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(globalNotificationDto);

            // Default mapping
            globalNotificationDto.Adapt(notification);
            notification.LastModifiedByUserId = _userId;
            notification.LastModifiedOn = DateTimeOffset.UtcNow;

            // Additional Mapping
            // TODO: UPDATE ADDITIONAL MAPPING ONCE ENTITY IS FORMED

            // Update notification
            _unitOfWork.NotificationRepo.Update(notification);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = notification.Adapt<GlobalNotificationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notification updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a global notification by its ID. This operation is only allowed within 10 minutes of creation.
    public async Task<ServiceResponse<bool>> DeleteGlobalNotificationAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete notification. Please try again"
        };

        try
        {
            // Validate notification existence
            var notification = await _unitOfWork.NotificationRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == id &&
                                            !w.IsSystemGenerated)
                                        .SingleOrDefaultAsync();

            // Notification does not exist
            if (notification == null)
            {
                serviceResponse.Message = "Notification does not exist";
                return serviceResponse;
            }

            // Notification is older than 10 minutes
            if (notification.CreatedOn.AddMinutes(10) < DateTimeOffset.UtcNow)
            {
                serviceResponse.Message = "Notification is older than 10 minutes and cannot be updated";
                return serviceResponse;
            }

            // TODO: Check relationship with other entities

            // Get M2M NotificationUser relationship records to delete
            var notificationUsers = await _unitOfWork.NotificationUserRepo
                                        .GetByConditionAsync(w => w.NotificationId == id)
                                        .ToListAsync();

            // Delete M2M relationship of NotificationUser
            _unitOfWork.NotificationUserRepo.Delete(notificationUsers);

            // Delete notification
            _unitOfWork.NotificationRepo.Delete(notification);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notification deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}
