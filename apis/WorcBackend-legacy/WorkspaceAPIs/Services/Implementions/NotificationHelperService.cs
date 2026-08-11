namespace WorkspaceAPIs.Services;

public class NotificationHelperService : INotificationHelperService
{
    private readonly ILogger<NotificationHelperService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationHelperService(
        ILogger<NotificationHelperService> logger,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Add Notification User M2M relationship. SaveAsync required separately.
    public async Task<bool> AddNotificationUsers(Guid notificationId, List<Guid> userIds)
    {
        try
        {
            // Resolve each user's tenant so the TenantId is always populated from the User table
            // (rather than defaulting to Guid.Empty).
            var userTenantMap = await GetUserTenantMapAsync(userIds);

            // Add NotificationUser records
            var notificationUserList = new List<NotificationUser>();
            foreach (var userId in userIds)
            {
                notificationUserList.Add(new NotificationUser
                {
                    UserId = userId,
                    NotificationId = notificationId,
                    TenantId = userTenantMap.TryGetValue(userId, out var tenantId) ? tenantId : Guid.Empty,
                    IsRead = false
                });
            }

            // Insert list of NotificationUser records
            await _unitOfWork.NotificationUserRepo.InsertAsync(notificationUserList);

            // Task successful
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }
    }

    // Add Notification User M2M relationship with an explicit tenant stamp.
    // Used by the Super Admin flow where a single notification is delivered to users
    // across multiple tenants. Each user's TenantId is resolved from the User table so it
    // reflects that user's actual tenant (falling back to the provided tenantId when the
    // user cannot be found). SaveAsync required separately.
    public async Task<bool> AddNotificationUsers(Guid notificationId, Guid tenantId, List<Guid> userIds)
    {
        try
        {
            // Resolve each user's tenant from the User table so the TenantId is always
            // accurate per recipient, regardless of whether the notification was created
            // by a Tenant Admin or a Super Admin.
            var userTenantMap = await GetUserTenantMapAsync(userIds);

            // Add NotificationUser records
            var notificationUserList = new List<NotificationUser>();
            foreach (var userId in userIds)
            {
                notificationUserList.Add(new NotificationUser
                {
                    UserId = userId,
                    NotificationId = notificationId,
                    TenantId = userTenantMap.TryGetValue(userId, out var resolvedTenantId) ? resolvedTenantId : tenantId,
                    IsRead = false
                });
            }

            // Insert list of NotificationUser records
            await _unitOfWork.NotificationUserRepo.InsertAsync(notificationUserList);

            // Task successful
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }
    }

    // Update Notification User M2M relationship. SaveAsync required separately.
    public async Task<bool> UpdateNotificationUsers(Guid notificationId, List<Guid> userIds)
    {
        try
        {
            // Deduplicate the target user IDs to avoid duplicate NotificationUser records
            var targetUserIds = userIds.Distinct().ToList();

            // Get current userIds
            var currentUserIds = await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => w.NotificationId == notificationId)
                .Select(s => s.UserId)
                .ToListAsync();

            // Get relationship records to delete (existing users no longer in the target set)
            var relationToRemove = await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => w.NotificationId == notificationId && !targetUserIds.Contains(w.UserId))
                .ToListAsync();

            // Delete relationships records
            _unitOfWork.NotificationUserRepo.Delete(relationToRemove);

            // Get userIds to add (in the target set but not already present) — prevents duplicates
            var userIdsToAdd = targetUserIds.Where(w => !currentUserIds.Contains(w)).ToList();

            // Resolve each user's tenant so the TenantId is always populated from the User table
            // (rather than defaulting to Guid.Empty).
            var userTenantMap = await GetUserTenantMapAsync(userIdsToAdd);

            // Add NotificationUser relationship records
            var notificationUserList = userIdsToAdd.Select(userId => new NotificationUser
            {
                UserId = userId,
                NotificationId = notificationId,
                TenantId = userTenantMap.TryGetValue(userId, out var tenantId) ? tenantId : Guid.Empty,
                IsRead = false
            }).ToList();

            // Insert list of NotificationUser records
            await _unitOfWork.NotificationUserRepo.InsertAsync(notificationUserList);

            // Task successful
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }
    }

    // Builds a map of UserId -> TenantId from the WorkspaceUser (User) table for the given
    // user IDs. Users not found are omitted from the map (callers fall back to Guid.Empty).
    private async Task<Dictionary<Guid, Guid>> GetUserTenantMapAsync(List<Guid> userIds)
    {
        var distinctUserIds = userIds.Distinct().ToList();
        if (distinctUserIds.Count == 0)
            return new Dictionary<Guid, Guid>();

        return await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(w => distinctUserIds.Contains(w.Id))
            .Select(w => new { w.Id, w.TenantId })
            .ToDictionaryAsync(w => w.Id, w => w.TenantId);
    }
}
