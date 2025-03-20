namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("Vault")]
public class VaultController : BaseApiController
{
    private readonly IVaultService _vaultService;

    public VaultController(IVaultService vaultService)
    {
        _vaultService = vaultService;
    }

    // Check if vault name is available
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsVaultNameAvailableAsync([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _vaultService.IsVaultNameAvailableAsync(checkAvailabilityDto));
    }

    // Get a list of vaults
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<VaultDto>>>> GetVaultsAsync()
    {
        return ResultHelper(await _vaultService.GetVaultsAsync());
    }

    // Get a specific vault by ID
    [HttpGet("{vaultId}")]
    public async Task<ActionResult<ServiceResponse<VaultDto>>> GetVaultAsync(Guid vaultId)
    {
        return ResultHelper(await _vaultService.GetVaultByIdAsync(vaultId));
    }

    // Create a new vault
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<VaultDto>>> CreateVaultAsync([FromBody] VaultDto vaultDto)
    {
        return ResultHelper(await _vaultService.InsertVaultAsync(vaultDto));
    }

    // Update an existing vault
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<VaultDto>>> UpdateVaultAsync([FromBody] VaultDto vaultDto)
    {
        return ResultHelper(await _vaultService.UpdateVaultAsync(vaultDto));
    }

    // Delete a vault by ID
    [HttpDelete("{vaultId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteVaultAsync(Guid vaultId)
    {
        return ResultHelper(await _vaultService.DeleteVaultAsync(vaultId));
    }

    // Delete multiple vaults
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteVaultsAsync(IEnumerable<Guid> vaultIds)
    {
        return ResultHelper(await _vaultService.DeleteVaultsAsync(vaultIds));
    }

    // Retrieves the decrypted values of a vault based on its ID.
    [HttpGet("decrypt/{vaultId}")]
    public async Task<IActionResult> RetrieveDecryptedVaultValue(Guid vaultId)
    {
        return ResultHelper(await _vaultService.RetrieveDecryptedVaultValueAsync(vaultId));
    }
}
