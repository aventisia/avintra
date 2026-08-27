namespace WorkspaceAPIs.Controllers;

[Route("app-secret")]
[ApiController]
[Authorize]
public class AppSecretController : BaseApiController
{
    private readonly IAppSecretService _appSecretService;

    public AppSecretController(IAppSecretService appSecretService)
    {
        _appSecretService = appSecretService;
    }

    // Get personal app secrets.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AppSecretDto>>>> GePersonalAppSecrets()
    {
        return ResultHelper(await _appSecretService.GetAllAppSecretsAsync(true));
    }

    // Get shared app secrets.
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AppSecretDto>>>> GetSharedAppSecrets()
    {
        return ResultHelper(await _appSecretService.GetAllAppSecretsAsync(false));
    }

    // Checks the availability of a app secret.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsAppSecretNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _appSecretService.IsAppSecretNameAvailableAsync(checkAvailabilityDto));
    }

    // Get app secrets for selection.
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableAppSecretOptions(AppSecretTypesEnum? type)
    {
        return ResultHelper(await _appSecretService.GetSelectableAppSecretOptionsAsync(type));
    }

    // Get app secret by ID.
    [HttpGet("{appSecretId}")]
    public async Task<ActionResult<ServiceResponse<AppSecretDto>>> GetAppSecretByIdAsync(Guid appSecretId)
    {
        return ResultHelper(await _appSecretService.GetAppSecretByIdAsync(appSecretId));
    }

    // Get app secret by name.
    [HttpGet("by-name/{appSecretName}")]
    public async Task<ActionResult<ServiceResponse<AppSecretDto>>> GetAppSecretByNameAsync(string appSecretName)
    {
        return ResultHelper(await _appSecretService.GetAppSecretByNameAsync(appSecretName));
    }

    // Create a new app secret.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AppSecretDto>>> CreateAppSecret([FromBody] AppSecretDto appSecretDto)
    {
        return ResultHelper(await _appSecretService.CreateAppSecretAsync(appSecretDto));
    }

    // Update an existing app secret.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AppSecretDto>>> UpdateAppSecret([FromBody] AppSecretDto appSecretDto)
    {
        return ResultHelper(await _appSecretService.UpdateAppSecretAsync(appSecretDto));
    }

    // Delete an app secret by ID.
    [HttpDelete("{appSecretId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAppSecret(Guid appSecretId)
    {
        return ResultHelper(await _appSecretService.DeleteAppSecretAsync(appSecretId));
    }

    // Delete multiple app secrets.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAppSecrets([FromBody] List<Guid> appSecretIds)
    {
        return ResultHelper(await _appSecretService.DeleteAppSecretsAsync(appSecretIds));
    }

    // Get app secret with actual data.
    [HttpGet("decrypted-data/{appSecretId}")]
    public async Task<ActionResult<ServiceResponse<AppSecretDto>>> GetAppSecretDetailAsync(Guid appSecretId)
    {
        return ResultHelper(await _appSecretService.GetAppSecretDetailAsync(appSecretId));
    }

    // Get app secret with actual data by name within the current environment.
    [HttpGet("decrypted-data/by-name/{appSecretName}")]
    public async Task<ActionResult<ServiceResponse<AppSecretDto>>> GetAppSecretDetailByNameAsync(string appSecretName)
    {
        return ResultHelper(await _appSecretService.GetAppSecretDetailByNameAsync(appSecretName));
    }

    // Mint a Corsair OAuth connect link for an App Secret.
    [HttpPost("{appSecretId}/connect-link")]
    public async Task<ActionResult<ServiceResponse<CorsairConnectLink>>> CreateOAuthConnectLink(Guid appSecretId)
    {
        return ResultHelper(await _appSecretService.CreateOAuthConnectLinkAsync(appSecretId));
    }

    // Get the Corsair OAuth connection status for an App Secret.
    [HttpGet("{appSecretId}/oauth-status")]
    public async Task<ActionResult<ServiceResponse<CorsairConnectionStatus>>> GetOAuthConnectionStatus(Guid appSecretId)
    {
        return ResultHelper(await _appSecretService.GetOAuthConnectionStatusAsync(appSecretId));
    }
}