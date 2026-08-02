namespace WorkspaceAPIs.Services;

public interface IWebhookTriggerService
{
    Task<ServiceResponse<IEnumerable<WebhookTriggerDto>>> GetWebhookTriggerListAsync(bool isPersonal);
    Task<ServiceResponse<WebhookTriggerDto>> GetWebhookTriggerAsync(Guid triggerId);
    Task<ServiceResponse<WebhookTriggerDto>> CreateWebhookTriggerAsync(WebhookTriggerDto dto);
    Task<ServiceResponse<WebhookTriggerDto>> UpdateWebhookTriggerAsync(WebhookTriggerDto dto);
    Task<ServiceResponse<bool>> DeleteWebhookTriggerAsync(Guid triggerId);
    Task<ServiceResponse<bool>> DeleteWebhookTriggersAsync(IEnumerable<Guid> triggerIds);
    Task<ServiceResponse<TrueFalseResultDto>> IsWebhookTriggerNameAvailableAsync(CheckAvailabilityDto dto);
    Task<ServiceResponse<AssignAgentTriggerDto>> GetAgentByWebhookTriggerAsync(Guid triggerId);
}
