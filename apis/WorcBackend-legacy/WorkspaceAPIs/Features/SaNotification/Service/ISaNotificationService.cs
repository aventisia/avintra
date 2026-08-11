using AspNetToolkit.DTOs;

namespace WorkspaceAPIs.Services;

public interface ISaNotificationService
{
    Task<ServiceResponse<SaNotificationDto>> GetSaNotificationAsync(Guid id);
    Task<ServiceResponse<IEnumerable<SaNotificationDto>>> GetSaNotificationsAsync();
    Task<ServiceResponse<SaNotificationDto>> InsertSaNotificationAsync(CreateSaNotificationDto createSaNotificationDto);
    Task<ServiceResponse<SaNotificationDto>> UpdateSaNotificationAsync(CreateSaNotificationDto createSaNotificationDto, Guid id);
    Task<ServiceResponse<bool>> DeleteSaNotificationAsync(Guid id);
    Task<ServiceResponse<int>> DeleteMultipleSaNotificationsAsync(IEnumerable<Guid> ids);
    Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> SearchUsersAsync(string searchKey);
    Task<ServiceResponse<IEnumerable<SaTenantOptionDto>>> GetTenantsAsync();
    Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> GetSaNotificationRecipientsAsync(Guid id);
}
