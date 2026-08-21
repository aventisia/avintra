namespace WorkspaceAPIs.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationHelperService _notificationHelperService;
    private readonly INotificationRecipientResolver _recipientResolver;
    private readonly IEmailService _emailService;
    private readonly TenantDbContext _tenantDbContext;
    private readonly Guid _userId;
    private readonly Guid _userTenantId;
    private readonly List<string> _userRoles;

    public NotificationService(
        ILogger<NotificationService> logger,
        IUnitOfWork unitOfWork,
        INotificationHelperService notificationHelperService,
        INotificationRecipientResolver recipientResolver,
        IEmailService emailService,
        TenantDbContext tenantDbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId, _userTenantId and _userRoles
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userTenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _userRoles = httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();

        _logger = logger;
        _unitOfWork = unitOfWork;
        _notificationHelperService = notificationHelperService;
        _recipientResolver = recipientResolver;
        _emailService = emailService;
        _tenantDbContext = tenantDbContext;
    }

    // True when the caller holds the Tenant Admin ("TA") role.
    private bool IsTenantAdmin()
    {
        return _userRoles.Contains("TA");
    }

    // Validates cross-field constraints on the create/update payload.
    // Returns null when valid, otherwise the error message to surface.
    private string? ValidateNotificationRequest(CreateNotificationDto createNotificationDto)
    {
        // Message must not be empty after trimming
        if (string.IsNullOrWhiteSpace(createNotificationDto.Message))
            return "Message is required.";

        // SelectedUsers requires a non-empty TargetUserIds list
        if (createNotificationDto.AudienceScope == AudienceScopeEnum.SelectedUsers &&
            (createNotificationDto.TargetUserIds == null || createNotificationDto.TargetUserIds.Count == 0))
            return "Target user IDs are required when audience scope is Selected Users.";

        // SelectedRoles requires a non-empty RoleIds list
        if (createNotificationDto.AudienceScope == AudienceScopeEnum.SelectedRoles &&
            (createNotificationDto.RoleIds == null || createNotificationDto.RoleIds.Count == 0))
            return "Role IDs are required when audience scope is Selected Roles.";

        // SelectedTenants requires a non-empty TargetTenantIds list (Tenant Admin only)
        if (createNotificationDto.AudienceScope == AudienceScopeEnum.SelectedTenants)
        {
            if (!IsTenantAdmin())
                return "Only Tenant Admins can target selected tenants.";

            if (createNotificationDto.TargetTenantIds == null || createNotificationDto.TargetTenantIds.Count == 0)
                return "Target tenant IDs are required when audience scope is Selected Tenants.";
        }

        // ScheduledFor must be in the future if provided
        if (createNotificationDto.ScheduledFor.HasValue && createNotificationDto.ScheduledFor.Value <= DateTimeOffset.UtcNow)
            return "Scheduled send time must be in the future.";

        // RecurrenceEndOn (Schedule End) must be after ScheduledFor (Schedule Send) or null
        if (createNotificationDto.RecurrenceEndOn.HasValue)
        {
            if (!createNotificationDto.ScheduledFor.HasValue)
                return "Scheduled send time is required when a schedule end time is provided.";

            if (createNotificationDto.RecurrenceEndOn.Value <= createNotificationDto.ScheduledFor.Value)
                return "Schedule end time must be after the scheduled send time.";
        }

        return null;
    }

    // Retrieves a notification by its ID.
    public async Task<ServiceResponse<NotificationDto>> GetNotificationAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<NotificationDto>.Create("Failed to retrieve notification", 400);

        try
        {
            // Try to get notification
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.Id == id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            // Notification does not exist
            if (notification == null)
            {
                serviceResponse.Update("Notification does not exist", 404);
                return serviceResponse;
            }

            // Map notification
            var notificationDto = notification.Adapt<NotificationDto>();
            notificationDto.RecipientCount = await CountNotificationRecipientsAsync(id);

            // Task successful
            serviceResponse.Update("Notification retrieved successfully", 200, notificationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notification {Id}", id);
        }

        return serviceResponse;
    }

    // Retrieves list of notifications.
    public async Task<ServiceResponse<IEnumerable<NotificationDto>>> GetNotificationsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<IEnumerable<NotificationDto>>.Create("Failed to retrieve notifications", 400);

        try
        {
            // Try to get notifications
            var notifications = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => !w.IsSuperAdminNotification)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Map notifications
            var notificationDtos = notifications.Adapt<List<NotificationDto>>();
            foreach (var notificationDto in notificationDtos)
            {
                notificationDto.RecipientCount = await CountNotificationRecipientsAsync(notificationDto.Id);
            }

            // Task successful
            serviceResponse.Update("Notifications retrieved successfully", 200, notificationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notifications");
        }

        return serviceResponse;
    }

    // Inserts a new notification.
    public async Task<ServiceResponse<NotificationDto>> InsertNotificationAsync(CreateNotificationDto createNotificationDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<NotificationDto>.Create("Failed to insert notification. Please try again", 400);

        try
        {
            // Trim dto' string props
            createNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(createNotificationDto);

            // Validate cross-field constraints
            var validationError = ValidateNotificationRequest(createNotificationDto);
            if (validationError != null)
            {
                serviceResponse.Update(validationError, 400);
                return serviceResponse;
            }

            // Default mapping
            var newNotification = createNotificationDto.Adapt<Notification>();
            newNotification.Id = Guid.NewGuid();
            newNotification.CreatedByUserId = _userId;
            newNotification.LastModifiedByUserId = _userId;

            // Additional Mapping
            newNotification.IsSystemGenerated = false; // DO NOT set it to true
            newNotification.SourceType = NotificationSourceEnum.Manual;

            // Serialize recurrence day lists to JSON for persistence
            newNotification.RecurrenceWeekdays = SerializeIntList(createNotificationDto.RecurrenceWeekdays);
            newNotification.RecurrenceMonthDays = SerializeIntList(createNotificationDto.RecurrenceMonthDays);

            // Determine whether the notification is scheduled for a future time
            var isScheduled = createNotificationDto.ScheduledFor.HasValue &&
                              createNotificationDto.ScheduledFor.Value > DateTimeOffset.UtcNow;

            newNotification.Status = isScheduled ? NotificationStatusEnum.Scheduled : NotificationStatusEnum.Sent;
            newNotification.SentOn = isScheduled ? null : DateTimeOffset.UtcNow;

            // Resolve recipient user IDs based on the audience scope
            var userIds = await ResolveRecipientUserIdsAsync(createNotificationDto);

            // Exclude the current user from receiving their own notification
            if (userIds.Contains(_userId))
            {
                userIds.Remove(_userId);
            }

            // No recipients resolved
            if (userIds.Count == 0)
            {
                serviceResponse.Update("No valid recipients found for the notification", 400);
                return serviceResponse;
            }

            // Persist the resolved recipient IDs so the dispatch job can create NotificationUser
            // rows and send emails when a scheduled notification's execution time is reached.
            newNotification.RecipientUserIds = SerializeGuidList(userIds);

            // Insert notification
            await _unitOfWork.NotificationRepo.InsertAsync(newNotification);

            // For scheduled notifications, do NOT create NotificationUser rows here; the dispatch
            // job creates them when the scheduled time is reached. Immediate notifications get
            // their rows now so they appear instantly.
            if (!isScheduled)
            {
                if (!await _notificationHelperService.AddNotificationUsers(newNotification.Id, userIds))
                {
                    serviceResponse.Update("Failed to insert NotificationUser relationship", 400);
                    return serviceResponse;
                }
            }

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Update("Context SaveChanges failed while inserting new notification", 400);
                return serviceResponse;
            }

            // Send email for Email/Both delivery channels. For immediate notifications (marked Sent
            // at insert and never hit the dispatch job) the email is sent here. Scheduled
            // notifications defer email to the dispatch job when the scheduled time is reached.
            if (!isScheduled &&
                (newNotification.DeliveryChannel == DeliveryChannelEnum.Email ||
                 newNotification.DeliveryChannel == DeliveryChannelEnum.Both))
            {
                await SendNotificationEmailAsync(newNotification, userIds);
            }

            // Map notification
            var notificationDto = newNotification.Adapt<NotificationDto>();
            notificationDto.CreatedBy = await GetUserDisplayNameAsync(_userId);
            notificationDto.LastModifiedBy = notificationDto.CreatedBy;
            notificationDto.RecipientCount = await CountNotificationRecipientsAsync(newNotification.Id);

            // Task successful
            serviceResponse.Update("Notification created successfully", 201, notificationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inserting notification");
        }

        return serviceResponse;
    }

    // Updates an existing notification. Only allowed while the notification has not been sent.
    public async Task<ServiceResponse<NotificationDto>> UpdateNotificationAsync(CreateNotificationDto createNotificationDto, Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<NotificationDto>.Create("Failed to update notification. Please try again", 400);

        try
        {
            // Validate notification existence
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.Id == id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            // Notification does not exist
            if (notification == null)
            {
                serviceResponse.Update("Notification does not exist", 404);
                return serviceResponse;
            }

            // Notification has already been sent and is locked
            if (notification.Status == NotificationStatusEnum.Sent)
            {
                serviceResponse.Update("Notification has already been sent and cannot be updated", 400);
                return serviceResponse;
            }

            // Trim dto' string props
            createNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(createNotificationDto);

            // Validate cross-field constraints
            var validationError = ValidateNotificationRequest(createNotificationDto);
            if (validationError != null)
            {
                serviceResponse.Update(validationError, 400);
                return serviceResponse;
            }

            // Default mapping
            createNotificationDto.Adapt(notification);
            notification.LastModifiedByUserId = _userId;
            notification.LastModifiedOn = DateTimeOffset.UtcNow;

            // Serialize recurrence day lists to JSON for persistence
            notification.RecurrenceWeekdays = SerializeIntList(createNotificationDto.RecurrenceWeekdays);
            notification.RecurrenceMonthDays = SerializeIntList(createNotificationDto.RecurrenceMonthDays);

            // Re-evaluate the status based on the (possibly changed) schedule
            var isScheduled = createNotificationDto.ScheduledFor.HasValue &&
                              createNotificationDto.ScheduledFor.Value > DateTimeOffset.UtcNow;
            if (isScheduled)
            {
                notification.Status = NotificationStatusEnum.Scheduled;
                notification.SentOn = null;
            }
            else if (notification.Status == NotificationStatusEnum.Scheduled)
            {
                // A previously scheduled notification that is now immediate
                notification.Status = NotificationStatusEnum.Sent;
                notification.SentOn = DateTimeOffset.UtcNow;
            }

            // Update notification
            _unitOfWork.NotificationRepo.Update(notification);

            // Resolve recipient user IDs based on the audience scope
            var userIds = await ResolveRecipientUserIdsAsync(createNotificationDto);

            // Exclude the current user from receiving their own notification
            if (userIds.Contains(_userId))
            {
                userIds.Remove(_userId);
            }

            // Persist the resolved recipient IDs so the dispatch job can create NotificationUser
            // rows and send emails when a scheduled notification's execution time is reached.
            notification.RecipientUserIds = SerializeGuidList(userIds);

            // For scheduled notifications, do NOT update NotificationUser rows here; the dispatch
            // job creates them when the scheduled time is reached. Immediate notifications get
            // their rows updated now so they reflect the latest audience instantly.
            if (!isScheduled)
            {
                if (!await _notificationHelperService.UpdateNotificationUsers(notification.Id, userIds))
                {
                    serviceResponse.Update("Failed to update NotificationUser relationship", 400);
                    return serviceResponse;
                }
            }

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Update("Context SaveChanges failed while updating notification", 400);
                return serviceResponse;
            }

            // Send email for Email/Both delivery channels. For immediate notifications (marked Sent
            // at insert and never hit the dispatch job) the email is sent here. Scheduled
            // notifications defer email to the dispatch job when the scheduled time is reached.
            if (!isScheduled &&
                (notification.DeliveryChannel == DeliveryChannelEnum.Email ||
                 notification.DeliveryChannel == DeliveryChannelEnum.Both))
            {
                await SendNotificationEmailAsync(notification, userIds);
            }

            // Map notification
            var notificationDto = notification.Adapt<NotificationDto>();
            notificationDto.RecipientCount = await CountNotificationRecipientsAsync(notification.Id);

            // Task successful
            serviceResponse.Update("Notification updated successfully", 200, notificationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating notification {Id}", id);
        }

        return serviceResponse;
    }

    // Deletes a notification by its ID. Only allowed while the notification has not been sent.
    public async Task<ServiceResponse<bool>> DeleteNotificationAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete notification. Please try again", 400);

        try
        {
            // Validate notification existence
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.Id == id)
                .SingleOrDefaultAsync();

            // Notification does not exist
            if (notification == null)
            {
                serviceResponse.Update("Notification does not exist", 404);
                return serviceResponse;
            }

            // Notification has already been sent and is locked
            if (notification.Status == NotificationStatusEnum.Sent)
            {
                serviceResponse.Update("Notification has already been sent and cannot be deleted", 400);
                return serviceResponse;
            }

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
                serviceResponse.Update("Context SaveChanges failed while deleting notification", 400);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Update("Notification deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification {Id}", id);
        }

        return serviceResponse;
    }

    // Deletes multiple notifications by their IDs. Only allowed while the notifications have not been sent.
    public async Task<ServiceResponse<int>> DeleteMultipleNotificationsAsync(IEnumerable<Guid> ids)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<int>.Create("Failed to delete notifications. Please try again", 400);

        try
        {
            var notificationIds = ids.ToList();

            // No IDs provided
            if (notificationIds.Count == 0)
            {
                serviceResponse.Update("No notification IDs provided", 400);
                return serviceResponse;
            }

            // Get the notifications matching the provided IDs (regardless of status)
            var matchingNotifications = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => notificationIds.Contains(w.Id))
                .ToListAsync();

            // No matching records found
            if (matchingNotifications.Count == 0)
            {
                serviceResponse.Update("No matching notifications found to delete", 404);
                return serviceResponse;
            }

            // Get the notifications to delete (excluding sent/locked ones)
            var notificationsToDelete = matchingNotifications
                .Where(w => w.Status != NotificationStatusEnum.Sent)
                .ToList();

            // None are deletable
            if (notificationsToDelete.Count == 0)
            {
                serviceResponse.Update("No deletable notifications found", 404);
                return serviceResponse;
            }

            // Get M2M NotificationUser relationship records to delete
            var deletableNotificationIds = notificationsToDelete.Select(s => s.Id).ToList();
            var notificationUsers = await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => deletableNotificationIds.Contains(w.NotificationId))
                .ToListAsync();

            // Delete M2M relationships
            _unitOfWork.NotificationUserRepo.Delete(notificationUsers);

            // Delete notifications
            _unitOfWork.NotificationRepo.Delete(notificationsToDelete);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Update("Context SaveChanges failed while deleting notifications", 400);
                return serviceResponse;
            }

            // Task successful - return the count of deleted records
            serviceResponse.Update("Notifications deleted successfully", 200, notificationsToDelete.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting multiple notifications");
        }

        return serviceResponse;
    }

    // Resolves recipient user IDs based on the audience scope.
    private async Task<List<Guid>> ResolveRecipientUserIdsAsync(CreateNotificationDto createNotificationDto)
    {
        // SelectedRoles: resolve users holding the selected roles, scoped to the caller's tenant
        if (createNotificationDto.AudienceScope == AudienceScopeEnum.SelectedRoles)
        {
            var roleNames = createNotificationDto.RoleIds ?? new List<string>();
            if (roleNames.Count == 0)
                return new List<Guid>();

            return await _recipientResolver.ResolveUserIdsByRoleNamesAsync(
                roleNames,
                _userTenantId);
        }

        // SelectedUsers: keep only users belonging to the caller's own tenant (server-side isolation)
        if (createNotificationDto.AudienceScope == AudienceScopeEnum.SelectedUsers)
        {
            var requestedUserIds = createNotificationDto.TargetUserIds ?? new List<Guid>();

            var validUserIds = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => w.TenantId == _userTenantId && requestedUserIds.Contains(w.Id))
                .Select(s => s.Id)
                .ToListAsync();

            return validUserIds;
        }

        // SelectedTenants: Tenant Admin only, but restricted to the caller's own tenant
        if (createNotificationDto.AudienceScope == AudienceScopeEnum.SelectedTenants)
        {
            if (!IsTenantAdmin())
                return new List<Guid>();

            return await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => w.TenantId == _userTenantId)
                .Select(s => s.Id)
                .ToListAsync();
        }

        // AllUsers (default): all users of the caller's tenant
        return await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(w => w.TenantId == _userTenantId)
            .Select(s => s.Id)
            .ToListAsync();
    }

    // Resolves the recipient users of a notification.
    private async Task<List<AppUserBaseDto>> ResolveNotificationRecipientsAsync(Guid notificationId)
    {
        try
        {
            // Join NotificationUser with WorkspaceUser to return the full user details
            var recipients = await (
                from notificationUser in _unitOfWork.NotificationUserRepo.GetByConditionAsync(w => w.NotificationId == notificationId)
                join workspaceUser in _unitOfWork.WorkspaceUserRepo.GetAllAsync() on notificationUser.UserId equals workspaceUser.Id
                select new AppUserBaseDto
                {
                    Id = workspaceUser.Id,
                    UserName = workspaceUser.UserName,
                    FirstName = workspaceUser.FirstName,
                    LastName = workspaceUser.LastName,
                    AvatarSrc = workspaceUser.AvatarSrc
                })
                .ToListAsync();

            return recipients;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipients for notification {NotificationId}", notificationId);
            return new List<AppUserBaseDto>();
        }
    }

    // Retrieves the recipient users of a notification (used to prefill the edit form).
    public async Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> GetNotificationRecipientsAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<IEnumerable<AppUserBaseDto>>.Create("Failed to retrieve recipients", 400);
        try
        {
            var recipients = await ResolveNotificationRecipientsAsync(id);
            serviceResponse.Update("Recipients retrieved successfully", 200, recipients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipients for notification {Id}", id);
        }
        return serviceResponse;
    }

    // Counts the recipient users of a notification.
    private async Task<int> CountNotificationRecipientsAsync(Guid notificationId)
    {
        try
        {
            return await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => w.NotificationId == notificationId)
                .CountAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error counting recipients for notification {NotificationId}", notificationId);
            return 0;
        }
    }

    // Resolves the display name (First Last) of a user for audit fields.
    private async Task<string?> GetUserDisplayNameAsync(Guid userId)
    {
        try
        {
            var user = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => w.Id == userId)
                .Select(s => new { s.FirstName, s.LastName })
                .SingleOrDefaultAsync();

            if (user == null) return null;

            return $"{user.FirstName} {user.LastName}".Trim();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving display name for user {UserId}", userId);
            return null;
        }
    }

    // Serializes a list of integers to a JSON string for persistence (null-safe).
    private static string? SerializeIntList(List<int>? values)
    {
        if (values == null || values.Count == 0) return null;
        return System.Text.Json.JsonSerializer.Serialize(values);
    }

    // Serializes a list of GUIDs to a JSON string for persistence (null-safe).
    private static string? SerializeGuidList(List<Guid>? values)
    {
        if (values == null || values.Count == 0) return null;
        return System.Text.Json.JsonSerializer.Serialize(values);
    }

    // Sends a notification email to the given recipient user IDs for Email/Both channels.
    // Resolves email addresses from the AccountsDb read-only projection and sends via the
    // shared email service. No-op when there are no resolvable email addresses.
    private async Task SendNotificationEmailAsync(Notification notification, List<Guid> userIds)
    {
        if (notification == null || userIds == null || userIds.Count == 0)
            return;

        try
        {
            var emails = await _tenantDbContext.ReadOnlyAccountUsers
                .Where(u => userIds.Contains(u.Id) && !string.IsNullOrWhiteSpace(u.Email))
                .Select(u => u.Email!)
                .Distinct()
                .ToListAsync();

            if (emails.Count == 0)
            {
                _logger.LogWarning("No email addresses resolved for notification {NotificationId}.", notification.Id);
                return;
            }

            var toEmailAddresses = string.Join(",", emails);
            var subject = string.IsNullOrWhiteSpace(notification.Title) ? "Notification" : notification.Title;
            var content = notification.Message;

            var sent = await _emailService.SendEmail(toEmailAddresses, subject, content);
            if (!sent)
            {
                _logger.LogError("Failed to send notification email for {NotificationId} to {Recipients}.", notification.Id, toEmailAddresses);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification email for {NotificationId}.", notification.Id);
        }
    }
}
