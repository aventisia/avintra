namespace AccountsAPIs.Controllers;

[Route("app-integration")]
[ApiController]
[Authorize]
public class AppIntegrationController : BaseApiController
{
    private readonly IAppIntegrationService _appIntegrationService;

    public AppIntegrationController(IAppIntegrationService appIntegrationService)
    {
        _appIntegrationService = appIntegrationService;
    }

    // Get all app integrations.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AppIntegrationDto>>>> GetAllAppIntegrations()
    {
        return ResultHelper(await _appIntegrationService.GetAllAppIntegrationsAsync());
    }

    // Get app integration by ID.
    [HttpGet("{appIntegrationId}")]
    public async Task<ActionResult<ServiceResponse<AppIntegrationDto>>> GetAppIntegrationByIdAsync(Guid appIntegrationId)
    {
        return ResultHelper(await _appIntegrationService.GetAppIntegrationByIdAsync(appIntegrationId));
    }

    // Create a new app integration.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AppIntegrationDto>>> CreateAppIntegration([FromBody] AppIntegrationDto appIntegrationDto)
    {
        return ResultHelper(await _appIntegrationService.CreateAppIntegrationAsync(appIntegrationDto));
    }

    // Update an existing app integration.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AppIntegrationDto>>> UpdateAppIntegration([FromBody] AppIntegrationDto appIntegrationDto)
    {
        return ResultHelper(await _appIntegrationService.UpdateAppIntegrationAsync(appIntegrationDto));
    }

    // Delete an app integration by ID.
    [HttpDelete("{appIntegrationId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAppIntegration(Guid appIntegrationId)
    {
        return ResultHelper(await _appIntegrationService.DeleteAppIntegrationAsync(appIntegrationId));
    }

    // Delete multiple app integrations.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAppIntegrations([FromBody] List<Guid> appIntegrationIds)
    {
        return ResultHelper(await _appIntegrationService.DeleteAppIntegrationsAsync(appIntegrationIds));
    }
}
