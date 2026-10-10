namespace WorkspaceAPIs.Controllers;

[Route("vault/credentials")]
[ApiController]
[Authorize]
public class VaultCredentialController : BaseApiController
{
    private readonly IVaultCredentialService _vaultCredentialService;

    public VaultCredentialController(IVaultCredentialService vaultCredentialService)
    {
        _vaultCredentialService = vaultCredentialService;
    }

    /// <summary>Retrieves list of vault credentials.</summary>
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<VaultCredentialDto>>>> GetVaultCredentials()
    {
        return ResultHelper(await _vaultCredentialService.GetAllVaultCredentialsAsync(true));
    }

    /// <summary>Retrieves vault credentials shared with the current user.</summary>
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<VaultCredentialDto>>>> GetSharedVaultCredentials()
    {
        return ResultHelper(await _vaultCredentialService.GetAllVaultCredentialsAsync(false));
    }

    /// <summary>Checks whether a vault credential name is available.</summary>
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsVaultCredentialNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _vaultCredentialService.IsVaultCredentialNameAvailableAsync(checkAvailabilityDto));
    }

    /// <summary>Retrieves vault credentials as selectable options.</summary>
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableVaultCredentialOptions(VaultCredentialTypesEnum? type)
    {
        return ResultHelper(await _vaultCredentialService.GetSelectableVaultCredentialOptionsAsync(type));
    }

    /// <summary>Retrieves a vault credential by its ID.</summary>
    [HttpGet("{vaultCredentialId}")]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> GetVaultCredentialById(Guid vaultCredentialId)
    {
        return ResultHelper(await _vaultCredentialService.GetVaultCredentialByIdAsync(vaultCredentialId));
    }

    /// <summary>Retrieves a vault credential by its name.</summary>
    [HttpGet("by-name/{vaultCredentialName}")]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> GetVaultCredentialByName(string vaultCredentialName)
    {
        return ResultHelper(await _vaultCredentialService.GetVaultCredentialByNameAsync(vaultCredentialName));
    }

    /// <summary>Insert a new vault credential.</summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> CreateVaultCredential([FromBody] VaultCredentialDto vaultCredentialDto)
    {
        return ResultHelper(await _vaultCredentialService.CreateVaultCredentialAsync(vaultCredentialDto));
    }

    /// <summary>Updates an existing vault credential.</summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> UpdateVaultCredential([FromBody] VaultCredentialDto vaultCredentialDto)
    {
        return ResultHelper(await _vaultCredentialService.UpdateVaultCredentialAsync(vaultCredentialDto));
    }

    /// <summary>Deletes an existing vault credential.</summary>
    [HttpDelete("{vaultCredentialId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteVaultCredential(Guid vaultCredentialId)
    {
        return ResultHelper(await _vaultCredentialService.DeleteVaultCredentialAsync(vaultCredentialId));
    }

    /// <summary>Deletes multiple vault credentials by their IDs.</summary>
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteVaultCredentials([FromBody] List<Guid> vaultCredentialIds)
    {
        return ResultHelper(await _vaultCredentialService.DeleteVaultCredentialsAsync(vaultCredentialIds));
    }

    /// <summary>Retrieves a vault credential with decrypted values by its ID.</summary>
    [HttpGet("decrypted-data/{vaultCredentialId}")]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> GetVaultCredentialDetail(Guid vaultCredentialId)
    {
        return ResultHelper(await _vaultCredentialService.GetVaultCredentialDetailAsync(vaultCredentialId));
    }

    /// <summary>Retrieves a vault credential with decrypted values by its name.</summary>
    [HttpGet("decrypted-data/by-name/{vaultCredentialName}")]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> GetVaultCredentialDetailByName(string vaultCredentialName)
    {
        return ResultHelper(await _vaultCredentialService.GetVaultCredentialDetailByNameAsync(vaultCredentialName));
    }

    /// <summary>Creates a Corsair OAuth connect link for a vault credential.</summary>
    [HttpPost("{vaultCredentialId}/connect-link")]
    public async Task<ActionResult<ServiceResponse<CorsairConnectLink>>> CreateOAuthConnectLink(Guid vaultCredentialId)
    {
        return ResultHelper(await _vaultCredentialService.CreateOAuthConnectLinkAsync(vaultCredentialId));
    }

    /// <summary>Retrieves the Corsair OAuth connection status for a vault credential.</summary>
    [HttpGet("{vaultCredentialId}/oauth-status")]
    public async Task<ActionResult<ServiceResponse<CorsairConnectionStatus>>> GetOAuthConnectionStatus(Guid vaultCredentialId)
    {
        return ResultHelper(await _vaultCredentialService.GetOAuthConnectionStatusAsync(vaultCredentialId));
    }

    /// <summary>Tests a Corsair vault credential connection.</summary>
    [HttpPost("{vaultCredentialId}/connection-test")]
    public async Task<ActionResult<ServiceResponse<CorsairCredentialTestResult>>> TestCorsairCredential(Guid vaultCredentialId)
    {
        return ResultHelper(await _vaultCredentialService.TestCorsairCredentialAsync(vaultCredentialId));
    }
}
