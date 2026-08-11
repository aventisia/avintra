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
            // Add NotificationUser records
            var notificationUserList = new List<NotificationUser>();
            foreach (var userId in userIds)
            {
                notificationUserList.Add(new NotificationUser
                {
                    UserId = userId,
                    NotificationId = notificationId,
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
    // across multiple tenants. SaveAsync required separately.
    public async Task<bool> AddNotificationUsers(Guid notificationId, Guid tenantId, List<Guid> userIds)
    {
        try
        {
            // Add NotificationUser records
            var notificationUserList = new List<NotificationUser>();
            foreach (var userId in userIds)
            {
                notificationUserList.Add(new NotificationUser
                {
                    UserId = userId,
                    NotificationId = notificationId,
                    TenantId = tenantId,
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

            // Add NotificationUser relationship records
            var notificationUserList = userIdsToAdd.Select(userId => new NotificationUser
            {
                UserId = userId,
                NotificationId = notificationId,
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
}
