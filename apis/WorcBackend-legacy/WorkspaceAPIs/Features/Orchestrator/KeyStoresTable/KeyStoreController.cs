namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("key-store")]
public class KeyStoreController : BaseApiController
{
    private readonly IKeyStoreService _keyStoreService;

    public KeyStoreController(IKeyStoreService keyStoreService)
    {
        _keyStoreService = keyStoreService;
    }

    // Check if key store name is available
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsKeyStoreNameAvailableAsync([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _keyStoreService.IsKeyStoreNameAvailableAsync(checkAvailabilityDto));
    }

    // Get a list of key stores
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<KeyStoreDto>>>> GetPersonalKeyStoresAsync()
    {
        return ResultHelper(await _keyStoreService.GetKeyStoresAsync(true));
    }

    // Get a list of shared key stores
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<KeyStoreDto>>>> GetSharedKeyStoresAsync()
    {
        return ResultHelper(await _keyStoreService.GetKeyStoresAsync(false));
    }

    // Fetch config key-value pairs for a list of keys (full list if no keys provided)
    [HttpPost("fetch")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConfigKeyValueDto>>>> FetchConfigKeyValuePairs([FromBody] IEnumerable<string>? keys)
    {
        return ResultHelper(await _keyStoreService.FetchConfigKeyValuePairsAsync(keys));
    }

    // Get a specific key store by ID
    [HttpGet("{keyStoreId}")]
    public async Task<ActionResult<ServiceResponse<KeyStoreDto>>> GetKeyStoreAsync(Guid keyStoreId)
    {
        return ResultHelper(await _keyStoreService.GetKeyStoreByIdAsync(keyStoreId));
    }

    // Create a new key store
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<KeyStoreDto>>> CreateKeyStoreAsync([FromBody] KeyStoreDto keyStoreDto)
    {
        return ResultHelper(await _keyStoreService.InsertKeyStoreAsync(keyStoreDto));
    }

    // Update an existing key store
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<KeyStoreDto>>> UpdateKeyStoreAsync([FromBody] KeyStoreDto keyStoreDto)
    {
        return ResultHelper(await _keyStoreService.UpdateKeyStoreAsync(keyStoreDto));
    }

    // Delete a key store by ID
    [HttpDelete("{keyStoreId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteKeyStoreAsync(Guid keyStoreId)
    {
        return ResultHelper(await _keyStoreService.DeleteKeyStoreAsync(keyStoreId));
    }

    // Delete multiple key stores
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteKeyStoresAsync([FromBody] IEnumerable<Guid> keyStoreIds)
    {
        return ResultHelper(await _keyStoreService.DeleteKeyStoresAsync(keyStoreIds));
    }

    // Decrypts the value of a key store by its ID.
    [HttpGet("decrypt/{keyStoreId}")]
    public async Task<IActionResult> DecryptKeyStoreValue(Guid keyStoreId)
    {
        return ResultHelper(await _keyStoreService.DecryptKeyStoreValueAsync(keyStoreId));
    }
}