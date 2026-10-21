namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("config-store")]
public class ConfigStoreController : BaseApiController
{
    private readonly IConfigStoreService _configStoreService;

    public ConfigStoreController(IConfigStoreService configStoreService)
    {
        _configStoreService = configStoreService;
    }

    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsConfigStoreNameAvailableAsync([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _configStoreService.IsConfigStoreNameAvailableAsync(checkAvailabilityDto));
    }

    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConfigStoreDto>>>> GetPersonalConfigStoresAsync()
    {
        return ResultHelper(await _configStoreService.GetConfigStoresAsync(true));
    }

    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConfigStoreDto>>>> GetSharedConfigStoresAsync()
    {
        return ResultHelper(await _configStoreService.GetConfigStoresAsync(false));
    }

    [HttpPost("fetch")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConfigKeyValueDto>>>> FetchConfigKeyValuePairs([FromBody] IEnumerable<string>? keys)
    {
        return ResultHelper(await _configStoreService.FetchConfigKeyValuePairsAsync(keys));
    }

    [HttpGet("{configStoreId}")]
    public async Task<ActionResult<ServiceResponse<ConfigStoreDto>>> GetConfigStoreAsync(Guid configStoreId)
    {
        return ResultHelper(await _configStoreService.GetConfigStoreByIdAsync(configStoreId));
    }

    [HttpGet("by-name/{configStoreName}")]
    public async Task<ActionResult<ServiceResponse<ConfigStoreDto>>> GetConfigStoreByNameAsync(string configStoreName)
    {
        return ResultHelper(await _configStoreService.GetConfigStoreByNameAsync(configStoreName));
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ConfigStoreDto>>> CreateConfigStoreAsync([FromBody] ConfigStoreDto configStoreDto)
    {
        return ResultHelper(await _configStoreService.InsertConfigStoreAsync(configStoreDto));
    }

    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ConfigStoreDto>>> UpdateConfigStoreAsync([FromBody] ConfigStoreDto configStoreDto)
    {
        return ResultHelper(await _configStoreService.UpdateConfigStoreAsync(configStoreDto));
    }

    [HttpDelete("{configStoreId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteConfigStoreAsync(Guid configStoreId)
    {
        return ResultHelper(await _configStoreService.DeleteConfigStoreAsync(configStoreId));
    }

    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteConfigStoresAsync([FromBody] IEnumerable<Guid> configStoreIds)
    {
        return ResultHelper(await _configStoreService.DeleteConfigStoresAsync(configStoreIds));
    }

    [HttpGet("decrypt/{configStoreId}")]
    public async Task<IActionResult> DecryptConfigStoreValue(Guid configStoreId)
    {
        return ResultHelper(await _configStoreService.DecryptConfigStoreValueAsync(configStoreId));
    }

    [HttpGet("decrypt/by-name/{configStoreName}")]
    public async Task<IActionResult> DecryptConfigStoreValueByName(string configStoreName)
    {
        return ResultHelper(await _configStoreService.DecryptConfigStoreValueByNameAsync(configStoreName));
    }
}