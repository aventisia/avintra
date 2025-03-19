namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("key-store")]
public class KeyStoreController : BaseApiController
{
    private readonly IKeyStoreService _KeyStoreService;

    public KeyStoreController(IKeyStoreService KeyStoreService)
    {
        _KeyStoreService = KeyStoreService;
    }

    // Check if key store name is available
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsKeyStoreNameAvailableAsync([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _KeyStoreService.IsKeyStoreNameAvailableAsync(checkAvailabilityDto));
    }

    // Get a list of key stores
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<KeyStoreDto>>>> GetKeyStoresAsync()
    {
        return ResultHelper(await _KeyStoreService.GetKeyStoresAsync());
    }

    // Get a specific key store by ID
    [HttpGet("{KeyStoreId}")]
    public async Task<ActionResult<ServiceResponse<KeyStoreDto>>> GetKeyStoreAsync(Guid KeyStoreId)
    {
        return ResultHelper(await _KeyStoreService.GetKeyStoreByIdAsync(KeyStoreId));
    }

    // Create a new key store
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<KeyStoreDto>>> CreateKeyStoreAsync([FromBody] KeyStoreDto KeyStoreDto)
    {
        return ResultHelper(await _KeyStoreService.InsertKeyStoreAsync(KeyStoreDto));
    }

    // Update an existing key store
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<KeyStoreDto>>> UpdateKeyStoreAsync([FromBody] KeyStoreDto KeyStoreDto)
    {
        return ResultHelper(await _KeyStoreService.UpdateKeyStoreAsync(KeyStoreDto));
    }

    // Delete a key store by ID
    [HttpDelete("{KeyStoreId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteKeyStoreAsync(Guid KeyStoreId)
    {
        return ResultHelper(await _KeyStoreService.DeleteKeyStoreAsync(KeyStoreId));
    }

    // Delete multiple key stores
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteKeyStoresAsync(IEnumerable<Guid> KeyStoreIds)
    {
        return ResultHelper(await _KeyStoreService.DeleteKeyStoresAsync(KeyStoreIds));
    }

    // Decrypts the value of a key store by its ID.
    [HttpGet("decrypt/{KeyStoreId}")]
    public async Task<IActionResult> DecryptKeyStoreValue(Guid KeyStoreId)
    {
        return ResultHelper(await _KeyStoreService.DecryptKeyStoreValueAsync(KeyStoreId));
    }
}