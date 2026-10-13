namespace WorkspaceAPIs.Controllers;

[Route("tenant-model-provider")]
[ApiController]
[Authorize(Roles = "TA")]
public class TenantModelProviderController : BaseApiController
{
    private readonly ITenantModelProviderService _tenantModelProviderService;

    public TenantModelProviderController(ITenantModelProviderService tenantModelProviderService)
    {
        _tenantModelProviderService = tenantModelProviderService;
    }

    // Fetch all model provider configurations for the current tenant.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantModelProviderDto>>>> GetAllModelProviders()
    {
        return ResultHelper(await _tenantModelProviderService.GetAllModelProvidersAsync());
    }

    // Fetch a model provider configuration by its identifier.
    [HttpGet("{modelProviderId}")]
    public async Task<ActionResult<ServiceResponse<TenantModelProviderDto>>> GetModelProvider(Guid modelProviderId)
    {
        return ResultHelper(await _tenantModelProviderService.GetModelProviderByIdAsync(modelProviderId));
    }

    /// <summary>
    /// Retrieves the enabled models across the current tenant's providers, optionally filtered by provider and capability.
    /// </summary>
    [HttpGet("enabled-models")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantEnabledModelDto>>>> GetEnabledModels(LLMProviderTypesEnum? providerType, ModelCapabilityEnum? capability)
    {
        return ResultHelper(await _tenantModelProviderService.GetEnabledModelsAsync(providerType, capability));
    }

    // Create or update a model provider configuration for the current tenant.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TenantModelProviderDto>>> UpsertModelProvider([FromBody] TenantModelProviderDto modelProviderDto)
    {
        return ResultHelper(await _tenantModelProviderService.UpsertModelProviderAsync(modelProviderDto));
    }

    // Delete a model provider configuration by its identifier.
    [HttpDelete("{modelProviderId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteModelProvider(Guid modelProviderId)
    {
        return ResultHelper(await _tenantModelProviderService.DeleteModelProviderAsync(modelProviderId));
    }
}
