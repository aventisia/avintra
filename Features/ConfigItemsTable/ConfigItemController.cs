namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("config-item")]
public class ConfigItemController : BaseApiController
{
    private readonly IConfigItemService _configItemService;

    public ConfigItemController(IConfigItemService configItemService)
    {
        _configItemService = configItemService;
    }

    // Check if config item name is available
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsConfigItemNameAvailableAsync([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _configItemService.IsConfigItemNameAvailableAsync(checkAvailabilityDto));
    }

    // Get a list of config items
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConfigItemDto>>>> GetConfigItemsAsync()
    {
        return ResultHelper(await _configItemService.GetConfigItemsAsync());
    }

    // Get a specific config item by ID
    [HttpGet("{configItemId}")]
    public async Task<ActionResult<ServiceResponse<ConfigItemDto>>> GetConfigItemAsync(Guid configItemId)
    {
        return ResultHelper(await _configItemService.GetConfigItemByIdAsync(configItemId));
    }

    // Create a new config item
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ConfigItemDto>>> CreateConfigItemAsync([FromBody] ConfigItemDto configItemDto)
    {
        return ResultHelper(await _configItemService.InsertConfigItemAsync(configItemDto));
    }

    // Update an existing config item
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ConfigItemDto>>> UpdateConfigItemAsync([FromBody] ConfigItemDto configItemDto)
    {
        return ResultHelper(await _configItemService.UpdateConfigItemAsync(configItemDto));
    }

    // Delete a config item by ID
    [HttpDelete("{configItemId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteConfigItemAsync(Guid configItemId)
    {
        return ResultHelper(await _configItemService.DeleteConfigItemAsync(configItemId));
    }

    // Delete multiple config items
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteConfigItemsAsync(IEnumerable<Guid> configItemIds)
    {
        return ResultHelper(await _configItemService.DeleteConfigItemsAsync(configItemIds));
    }
}