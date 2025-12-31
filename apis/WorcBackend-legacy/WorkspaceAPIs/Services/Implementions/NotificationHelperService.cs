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

    // Update Notification User M2M relationship. SaveAsync required separately.
    public async Task<bool> UpdateNotificationUsers(Guid notificationId, List<Guid> userIds)
    {
        try
        {
            // Get current userIds
            var currentUserIds = await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => w.NotificationId == notificationId)
                .Select(s => s.UserId)
                .ToListAsync();

            // Get userIds to add
            var userIdsToAdd = currentUserIds.Where(w => !currentUserIds.Contains(w)).ToList();

            // Get relationship records to delete
            var relationToRemove = await _unitOfWork.NotificationUserRepo
                .GetByConditionAsync(w => w.NotificationId == notificationId && !userIds.Contains(w.UserId))
                .ToListAsync();

            // Delete relationships records
            _unitOfWork.NotificationUserRepo.Delete(relationToRemove);

            // Add NotificationUser relationship records
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
}
