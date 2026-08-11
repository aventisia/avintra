using AspNetToolkit.Data;
using AspNetToolkit.DTOs;

namespace WorkspaceAPIs.Services;

public class SaNotificationService : ISaNotificationService
{
    private readonly ILogger<SaNotificationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TenantDbContext _tenantDbContext;
    private readonly INotificationHelperService _notificationHelperService;
    private readonly INotificationRecipientResolver _recipientResolver;
    private readonly IEmailService _emailService;
    private readonly Guid _userId;

    public SaNotificationService(
        ILogger<SaNotificationService> logger,
        IUnitOfWork unitOfWork,
        TenantDbContext tenantDbContext,
        INotificationHelperService notificationHelperService,
        INotificationRecipientResolver recipientResolver,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _tenantDbContext = tenantDbContext;
        _notificationHelperService = notificationHelperService;
        _recipientResolver = recipientResolver;
        _emailService = emailService;
    }

    // Validates cross-field constraints on the create/update payload.
    private string? ValidateSaNotificationRequest(CreateSaNotificationDto createSaNotificationDto)
    {
        if (string.IsNullOrWhiteSpace(createSaNotificationDto.Message))
            return "Message is required.";

        if (createSaNotificationDto.AudienceScope == AudienceScopeEnum.SelectedUsers &&
            (createSaNotificationDto.TargetUserIds == null || createSaNotificationDto.TargetUserIds.Count == 0))
            return "Target user IDs are required when audience scope is Selected Users.";

        if (createSaNotificationDto.AudienceScope == AudienceScopeEnum.SelectedRoles &&
            (createSaNotificationDto.RoleIds == null || createSaNotificationDto.RoleIds.Count == 0))
            return "Role IDs are required when audience scope is Selected Roles.";

        if (createSaNotificationDto.AudienceScope == AudienceScopeEnum.SelectedTenants &&
            (createSaNotificationDto.TargetTenantIds == null || createSaNotificationDto.TargetTenantIds.Count == 0))
            return "Target tenant IDs are required when audience scope is Selected Tenants.";

        // ScheduledFor must be in the future if provided
        if (createSaNotificationDto.ScheduledFor.HasValue && createSaNotificationDto.ScheduledFor.Value <= DateTimeOffset.UtcNow)
            return "Scheduled send time must be in the future.";

        // RecurrenceEndOn (Schedule End) must be after ScheduledFor (Schedule Send) or null
        if (createSaNotificationDto.RecurrenceEndOn.HasValue)
        {
            if (!createSaNotificationDto.ScheduledFor.HasValue)
                return "Scheduled send time is required when a schedule end time is provided.";

            if (createSaNotificationDto.RecurrenceEndOn.Value <= createSaNotificationDto.ScheduledFor.Value)
                return "Schedule end time must be after the scheduled send time.";
        }

        return null;
    }

    public async Task<ServiceResponse<SaNotificationDto>> GetSaNotificationAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<SaNotificationDto>.Create("Failed to retrieve notification", 400);
        try
        {
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.Id == id && w.IsSuperAdminNotification)
                .IgnoreQueryFilters()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            if (notification == null)
            {
                serviceResponse.Update("Notification does not exist", 404);
                return serviceResponse;
            }

            // Load the full fanned-out group so the original audience is returned when
            // viewing or editing any single row of a Super Admin notification.
            List<Notification> groupRows;
            if (notification.RefId.HasValue)
            {
                groupRows = await _unitOfWork.NotificationRepo
                    .GetByConditionAsync(w => w.RefId == notification.RefId.Value && w.IsSuperAdminNotification)
                    .IgnoreQueryFilters()
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                groupRows = new List<Notification> { notification };
            }

            var notificationDto = await BuildSaNotificationDtoAsync(notification, groupRows);

            serviceResponse.Update("Notification retrieved successfully", 200, notificationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notification {Id}", id);
        }
        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<SaNotificationDto>>> GetSaNotificationsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<SaNotificationDto>>.Create("Failed to retrieve notifications", 400);
        try
        {
            var notifications = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.IsSuperAdminNotification)
                .IgnoreQueryFilters()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Group the fanned-out rows by their shared RefId so each logical Super Admin
            // notification is shown exactly once with the full (aggregated) audience.
            var groups = notifications
                .GroupBy(n => n.RefId ?? n.Id)
                .ToList();

            var notificationDtos = new List<SaNotificationDto>();
            foreach (var group in groups)
            {
                // The representative row drives the shared metadata.
                var representative = group.OrderByDescending(o => o.CreatedOn).First();
                notificationDtos.Add(await BuildSaNotificationDtoAsync(representative, group.ToList()));
            }

            serviceResponse.Update("Notifications retrieved successfully", 200, notificationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notifications");
        }
        return serviceResponse;
    }

    public async Task<ServiceResponse<SaNotificationDto>> InsertSaNotificationAsync(CreateSaNotificationDto createSaNotificationDto)
    {
        var serviceResponse = ServiceResponse<SaNotificationDto>.Create("Failed to insert notification. Please try again", 400);
        try
        {
            createSaNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(createSaNotificationDto);

            var validationError = ValidateSaNotificationRequest(createSaNotificationDto);
            if (validationError != null)
            {
                serviceResponse.Update(validationError, 400);
                return serviceResponse;
            }

            // Resolve recipients grouped by their tenant so we can create one
            // Notification row per target tenant (each tenant's query filter sees it).
            var recipientsByTenant = await ResolveRecipientsByTenantAsync(createSaNotificationDto);

            if (recipientsByTenant.Count == 0)
            {
                serviceResponse.Update("No valid recipients found for the notification", 400);
                return serviceResponse;
            }

            // A single logical Super Admin notification fans out to one row per target
            // tenant (so each tenant's query filter and bell/history see it). All rows
            // share the same RefId so the original audience can be reconstructed when
            // editing or viewing any one of them.
            var notificationGroupId = Guid.NewGuid();

            var createdDtos = new List<SaNotificationDto>();
            foreach (var (tenantId, userIds) in recipientsByTenant)
            {
                // Exclude the current user from receiving their own notification
                if (userIds.Contains(_userId))
                {
                    userIds.Remove(_userId);
                }

                if (userIds.Count == 0)
                    continue;

                var newNotification = createSaNotificationDto.Adapt<Notification>();
                newNotification.Id = Guid.NewGuid();
                newNotification.RefId = notificationGroupId;
                newNotification.TenantId = tenantId;
                newNotification.CreatedByUserId = _userId;
                newNotification.LastModifiedByUserId = _userId;
                newNotification.IsSystemGenerated = false;
                newNotification.IsSuperAdminNotification = true;
                newNotification.SourceType = NotificationSourceEnum.Manual;

                // Serialize recurrence day lists to JSON for persistence
                newNotification.RecurrenceWeekdays = SerializeIntList(createSaNotificationDto.RecurrenceWeekdays);
                newNotification.RecurrenceMonthDays = SerializeIntList(createSaNotificationDto.RecurrenceMonthDays);

                // Determine whether the notification is scheduled for a future time
                var isScheduled = createSaNotificationDto.ScheduledFor.HasValue &&
                                  createSaNotificationDto.ScheduledFor.Value > DateTimeOffset.UtcNow;

                newNotification.Status = isScheduled ? NotificationStatusEnum.Scheduled : NotificationStatusEnum.Sent;
                newNotification.SentOn = isScheduled ? null : DateTimeOffset.UtcNow;

                await _unitOfWork.NotificationRepo.InsertAsync(newNotification);

                // Persist the resolved recipient IDs so the dispatch job can create NotificationUser
                // rows and send emails when a scheduled notification's execution time is reached.
                newNotification.RecipientUserIds = SerializeGuidList(userIds);

                // For scheduled notifications, do NOT create NotificationUser rows here; the dispatch
                // job creates them when the scheduled time is reached. Immediate notifications get
                // their rows now so they appear instantly.
                if (!isScheduled)
                {
                    if (!await _notificationHelperService.AddNotificationUsers(newNotification.Id, tenantId, userIds))
                    {
                        serviceResponse.Update("Failed to insert NotificationUser relationship", 400);
                        return serviceResponse;
                    }
                }

                if (!await _unitOfWork.SaveAsync())
                {
                    serviceResponse.Update("Context SaveChanges failed while inserting new notification", 400);
                    return serviceResponse;
                }

                // Send email for Email/Both delivery channels. For immediate notifications (marked
                // Sent at insert and never hit the dispatch job) the email is sent here. Scheduled
                // notifications defer email to the dispatch job when the scheduled time is reached.
                if (!isScheduled &&
                    (newNotification.DeliveryChannel == DeliveryChannelEnum.Email ||
                     newNotification.DeliveryChannel == DeliveryChannelEnum.Both))
                {
                    await SendNotificationEmailAsync(newNotification, userIds);
                }

                var notificationDto = newNotification.Adapt<SaNotificationDto>();
                notificationDto.CreatedBy = await GetUserDisplayNameAsync(_userId);
                notificationDto.LastModifiedBy = notificationDto.CreatedBy;
                notificationDto.RecipientCount = await CountNotificationRecipientsAsync(new List<Guid> { newNotification.Id });
                notificationDto.TenantCount = 1;
                createdDtos.Add(notificationDto);
            }

            serviceResponse.Update("Notification created successfully", 201, createdDtos.First());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inserting notification");
        }
        return serviceResponse;
    }

    public async Task<ServiceResponse<SaNotificationDto>> UpdateSaNotificationAsync(CreateSaNotificationDto createSaNotificationDto, Guid id)
    {
        var serviceResponse = ServiceResponse<SaNotificationDto>.Create("Failed to update notification. Please try again", 400);
        try
        {
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.Id == id && w.IsSuperAdminNotification)
                .IgnoreQueryFilters()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            if (notification == null)
            {
                serviceResponse.Update("Notification does not exist", 404);
                return serviceResponse;
            }

            if (notification.Status == NotificationStatusEnum.Sent)
            {
                serviceResponse.Update("Notification has already been sent and cannot be updated", 400);
                return serviceResponse;
            }

            createSaNotificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(createSaNotificationDto);

            var validationError = ValidateSaNotificationRequest(createSaNotificationDto);
            if (validationError != null)
            {
                serviceResponse.Update(validationError, 400);
                return serviceResponse;
            }

            createSaNotificationDto.Adapt(notification);
            notification.LastModifiedByUserId = _userId;
            notification.LastModifiedOn = DateTimeOffset.UtcNow;

            // Serialize recurrence day lists to JSON for persistence
            notification.RecurrenceWeekdays = SerializeIntList(createSaNotificationDto.RecurrenceWeekdays);
            notification.RecurrenceMonthDays = SerializeIntList(createSaNotificationDto.RecurrenceMonthDays);

            // Re-evaluate the status based on the (possibly changed) schedule
            var isScheduled = createSaNotificationDto.ScheduledFor.HasValue &&
                              createSaNotificationDto.ScheduledFor.Value > DateTimeOffset.UtcNow;
            if (isScheduled)
            {
                notification.Status = NotificationStatusEnum.Scheduled;
                notification.SentOn = null;
            }
            else if (notification.Status == NotificationStatusEnum.Scheduled)
            {
                notification.Status = NotificationStatusEnum.Sent;
                notification.SentOn = DateTimeOffset.UtcNow;
            }

            _unitOfWork.NotificationRepo.Update(notification);

            var recipientsByTenant = await ResolveRecipientsByTenantAsync(createSaNotificationDto);

            // Flatten all tenant recipients into a single list
            var userIds = recipientsByTenant.Values.SelectMany(v => v).ToList();

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

            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Update("Context SaveChanges failed while updating notification", 400);
                return serviceResponse;
            }

            // Send email for Email/Both delivery channels. For immediate notifications (marked
            // Sent at insert and never hit the dispatch job) the email is sent here. Scheduled
            // notifications defer email to the dispatch job when the scheduled time is reached.
            if (!isScheduled &&
                (notification.DeliveryChannel == DeliveryChannelEnum.Email ||
                 notification.DeliveryChannel == DeliveryChannelEnum.Both))
            {
                await SendNotificationEmailAsync(notification, userIds);
            }

            var notificationDto = notification.Adapt<SaNotificationDto>();
            notificationDto.RecipientCount = await CountNotificationRecipientsAsync(new List<Guid> { notification.Id });
            notificationDto.TenantCount = 1;

            serviceResponse.Update("Notification updated successfully", 200, notificationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating notification {Id}", id);        }
        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteSaNotificationAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete notification. Please try again", 400);
        try
        {
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.Id == id && w.IsSuperAdminNotification)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (notification == null)
            {
                serviceResponse.Update("Notification does not exist", 404);
                return serviceResponse;
            }

            if (notification.Status == NotificationStatusEnum.Sent)
            {
                serviceResponse.Update("Notification has already been sent and cannot be deleted", 400);
                return serviceResponse;
            }

            var notificationUsers = await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => w.NotificationId == id)
                .IgnoreQueryFilters()
                .ToListAsync();

            _unitOfWork.NotificationUserRepo.Delete(notificationUsers);
            _unitOfWork.NotificationRepo.Delete(notification);

            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Update("Context SaveChanges failed while deleting notification", 400);
                return serviceResponse;
            }

            serviceResponse.Update("Notification deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification {Id}", id);
        }
        return serviceResponse;
    }

    public async Task<ServiceResponse<int>> DeleteMultipleSaNotificationsAsync(IEnumerable<Guid> ids)
    {
        var serviceResponse = ServiceResponse<int>.Create("Failed to delete notifications. Please try again", 400);
        try
        {
            var notificationIds = ids.ToList();

            if (notificationIds.Count == 0)
            {
                serviceResponse.Update("No notification IDs provided", 400);
                return serviceResponse;
            }

            var matchingNotifications = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => notificationIds.Contains(w.Id) && w.IsSuperAdminNotification)
                .IgnoreQueryFilters()
                .ToListAsync();

            if (matchingNotifications.Count == 0)
            {
                serviceResponse.Update("No matching notifications found to delete", 404);
                return serviceResponse;
            }

            var notificationsToDelete = matchingNotifications
                .Where(w => w.Status != NotificationStatusEnum.Sent)
                .ToList();

            if (notificationsToDelete.Count == 0)
            {
                serviceResponse.Update("No deletable notifications found", 404);
                return serviceResponse;
            }

            var deletableNotificationIds = notificationsToDelete.Select(s => s.Id).ToList();
            var notificationUsers = await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => deletableNotificationIds.Contains(w.NotificationId))
                .IgnoreQueryFilters()
                .ToListAsync();

            _unitOfWork.NotificationUserRepo.Delete(notificationUsers);
            _unitOfWork.NotificationRepo.Delete(notificationsToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Update("Context SaveChanges failed while deleting notifications", 400);
                return serviceResponse;
            }

            serviceResponse.Update("Notifications deleted successfully", 200, notificationsToDelete.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting multiple notifications");
        }
        return serviceResponse;
    }

    // Resolves recipient user IDs grouped by their tenant.
    private async Task<Dictionary<Guid, List<Guid>>> ResolveRecipientsByTenantAsync(CreateSaNotificationDto createSaNotificationDto)
    {
        var result = new Dictionary<Guid, List<Guid>>();

        // SelectedRoles: resolve users holding the selected roles, grouped by their tenant.
        if (createSaNotificationDto.AudienceScope == AudienceScopeEnum.SelectedRoles)
        {
            var roleNames = createSaNotificationDto.RoleIds ?? new List<string>();
            if (roleNames.Count == 0) return result;

            var roleUserIds = await _recipientResolver.ResolveUserIdsByRoleNamesAsync(roleNames, null);

            if (roleUserIds.Count == 0) return result;

            var users = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => roleUserIds.Contains(w.Id))
                .Select(s => new { s.Id, s.TenantId })
                .ToListAsync();

            foreach (var user in users)
            {
                if (!result.TryGetValue(user.TenantId, out var list))
                {
                    list = new List<Guid>();
                    result[user.TenantId] = list;
                }
                list.Add(user.Id);
            }

            return result;
        }

        // SelectedUsers: resolve each requested user's tenant.
        if (createSaNotificationDto.AudienceScope == AudienceScopeEnum.SelectedUsers)
        {
            var requestedUserIds = createSaNotificationDto.TargetUserIds ?? new List<Guid>();
            if (requestedUserIds.Count == 0) return result;

            var users = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => requestedUserIds.Contains(w.Id))
                .Select(s => new { s.Id, s.TenantId })
                .ToListAsync();

            foreach (var user in users)
            {
                if (!result.TryGetValue(user.TenantId, out var list))
                {
                    list = new List<Guid>();
                    result[user.TenantId] = list;
                }
                list.Add(user.Id);
            }

            return result;
        }

        // SelectedTenants: resolve all users of the chosen tenants.
        if (createSaNotificationDto.AudienceScope == AudienceScopeEnum.SelectedTenants)
        {
            var targetTenantIds = createSaNotificationDto.TargetTenantIds ?? new List<Guid>();
            if (targetTenantIds.Count == 0) return result;

            var users = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => targetTenantIds.Contains(w.TenantId))
                .Select(s => new { s.Id, s.TenantId })
                .ToListAsync();

            foreach (var user in users)
            {
                if (!result.TryGetValue(user.TenantId, out var list))
                {
                    list = new List<Guid>();
                    result[user.TenantId] = list;
                }
                list.Add(user.Id);
            }

            return result;
        }

        // AllUsers (default): all users across all tenants.
        var allUsers = await _unitOfWork.WorkspaceUserRepo
            .GetAllAsync()
            .Select(s => new { s.Id, s.TenantId })
            .ToListAsync();

        foreach (var user in allUsers)
        {
            if (!result.TryGetValue(user.TenantId, out var list))
            {
                list = new List<Guid>();
                result[user.TenantId] = list;
            }
            list.Add(user.Id);
        }

        return result;
    }

    // Builds the response DTO for a Super Admin notification.
    private async Task<SaNotificationDto> BuildSaNotificationDtoAsync(Notification representative, List<Notification>? group = null)
    {
        var notificationDto = representative.Adapt<SaNotificationDto>();
        notificationDto.CreatedBy = representative.CreatedByUser != null
            ? $"{representative.CreatedByUser.FirstName} {representative.CreatedByUser.LastName}"
            : null;
        notificationDto.LastModifiedBy = representative.LastModifiedByUser != null
            ? $"{representative.LastModifiedByUser.FirstName} {representative.LastModifiedByUser.LastName}"
            : null;

        var groupRows = group ?? new List<Notification> { representative };
        var groupNotificationIds = groupRows.Select(r => r.Id).ToList();

        notificationDto.RecipientCount = await CountNotificationRecipientsAsync(groupNotificationIds);
        notificationDto.TenantCount = groupRows.Select(r => r.TenantId).Distinct().Count();

        return notificationDto;
    }

    // Resolves the targeted tenant(s) of a Super Admin notification for display in responses.
    private async Task<List<SaTenantOptionDto>> GetTargetTenantsAsync(List<Guid> tenantIds)
    {
        try
        {
            var tenants = await _tenantDbContext.ReadOnlyTenants
                .Where(w => tenantIds.Contains(w.Id))
                .Select(s => new SaTenantOptionDto
                {
                    Id = s.Id,
                    Name = s.Name
                })
                .OrderBy(o => o.Name)
                .ToListAsync();

            return tenants;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving target tenants");
            return new List<SaTenantOptionDto>();
        }
    }
    private async Task<List<AppUserBaseDto>> GetNotificationRecipientsAsync(List<Guid> notificationIds)
    {
        try
        {
            var recipients = await (
                from notificationUser in _unitOfWork.NotificationUserRepo.GetByConditionAsync(w => notificationIds.Contains(w.NotificationId)).IgnoreQueryFilters()
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
            _logger.LogError(ex, "Error retrieving recipients for notification {NotificationIds}", string.Join(", ", notificationIds));
            return new List<AppUserBaseDto>();
        }
    }

    // Retrieves the recipient users of a Super Admin notification (used to prefill the edit form).
    public async Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> GetSaNotificationRecipientsAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<IEnumerable<AppUserBaseDto>>.Create("Failed to retrieve recipients", 400);
        try
        {
            var notification = await _unitOfWork.NotificationRepo
                .GetByConditionAsync(w => w.Id == id && w.IsSuperAdminNotification)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (notification == null)
            {
                serviceResponse.Update("Notification does not exist", 404);
                return serviceResponse;
            }

            // Resolve the full fanned-out group so the original audience is returned.
            List<Guid> groupIds;
            if (notification.RefId.HasValue)
            {
                groupIds = await _unitOfWork.NotificationRepo
                    .GetByConditionAsync(w => w.RefId == notification.RefId.Value && w.IsSuperAdminNotification)
                    .IgnoreQueryFilters()
                    .Select(s => s.Id)
                    .ToListAsync();
            }
            else
            {
                groupIds = new List<Guid> { notification.Id };
            }

            var recipients = await GetNotificationRecipientsAsync(groupIds);
            serviceResponse.Update("Recipients retrieved successfully", 200, recipients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipients for notification {Id}", id);
        }
        return serviceResponse;
    }

    // Counts the recipient users across the given notification rows.
    private async Task<int> CountNotificationRecipientsAsync(List<Guid> notificationIds)
    {
        try
        {
            return await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => notificationIds.Contains(w.NotificationId))
                .IgnoreQueryFilters()
                .CountAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error counting recipients for notification {NotificationIds}", string.Join(", ", notificationIds));
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

    // Searches users across all tenants for the Super Admin recipient picker.
    public async Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> SearchUsersAsync(string searchKey)
    {
        var serviceResponse = ServiceResponse<IEnumerable<AppUserBaseDto>>.Create("Failed to search users", 400);
        try
        {
            if (string.IsNullOrWhiteSpace(searchKey))
            {
                serviceResponse.Update("Search key cannot be empty.", 400);
                return serviceResponse;
            }

            var users = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w =>
                    w.FirstName.ToLower().Contains(searchKey.ToLower()) ||
                    w.LastName.ToLower().Contains(searchKey.ToLower()) ||
                    w.UserName.ToLower().Contains(searchKey.ToLower()))
                .Select(s => new AppUserBaseDto
                {
                    Id = s.Id,
                    UserName = s.UserName,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    AvatarSrc = s.AvatarSrc
                })
                .Take(50)
                .ToListAsync();

            serviceResponse.Update("Users retrieved successfully", 200, users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users");
        }
        return serviceResponse;
    }

    // Retrieves the list of active tenants for the Super Admin audience picker.
    public async Task<ServiceResponse<IEnumerable<SaTenantOptionDto>>> GetTenantsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<SaTenantOptionDto>>.Create("Failed to retrieve tenants", 400);
        try
        {
            var tenants = await _tenantDbContext.ReadOnlyTenants
                .Where(w => !w.IsDisabled)
                .OrderBy(o => o.Name)
                .Select(s => new SaTenantOptionDto
                {
                    Id = s.Id,
                    Name = s.Name
                })
                .ToListAsync();

            serviceResponse.Update("Tenants retrieved successfully", 200, tenants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tenants");
        }
        return serviceResponse;
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
            if (sent)
            {
                _logger.LogInformation("Notification email sent for {NotificationId} to {Recipients}.", notification.Id, toEmailAddresses);
            }
            else
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
