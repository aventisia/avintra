namespace WorkspaceAPIs.Controllers;

[Route("tenant-vault-credential")]
[ApiController]
[Authorize(Roles = "TA")]
public class TenantVaultCredentialController : BaseApiController
{
    private readonly IVaultCredentialService _vaultCredentialService;

    public TenantVaultCredentialController(IVaultCredentialService vaultCredentialService)
    {
        _vaultCredentialService = vaultCredentialService;
    }

    /// <summary>Retrieves list of tenant-level vault credentials.</summary>
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<VaultCredentialDto>>>> GetTenantVaultCredentials()
    {
        return ResultHelper(await _vaultCredentialService.GetTenantVaultCredentialsAsync());
    }

    /// <summary>Retrieves tenant-level vault credentials as selectable options.</summary>
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableTenantVaultCredentialOptions(VaultCredentialTypesEnum? type)
    {
        return ResultHelper(await _vaultCredentialService.GetSelectableTenantVaultCredentialOptionsAsync(type));
    }

    /// <summary>Checks whether a tenant-level vault credential name is available.</summary>
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsTenantVaultCredentialNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _vaultCredentialService.IsTenantVaultCredentialNameAvailableAsync(checkAvailabilityDto));
    }

    /// <summary>Inserts a new tenant-level vault credential.</summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> InsertTenantVaultCredential([FromBody] VaultCredentialDto vaultCredentialDto)
    {
        return ResultHelper(await _vaultCredentialService.InsertTenantVaultCredentialAsync(vaultCredentialDto));
    }

    /// <summary>Updates an existing tenant-level vault credential.</summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<VaultCredentialDto>>> UpdateTenantVaultCredential([FromBody] VaultCredentialDto vaultCredentialDto)
    {
        return ResultHelper(await _vaultCredentialService.UpdateTenantVaultCredentialAsync(vaultCredentialDto));
    }

    /// <summary>Deletes an existing tenant-level vault credential.</summary>
    [HttpDelete("{vaultCredentialId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenantVaultCredential(Guid vaultCredentialId)
    {
        return ResultHelper(await _vaultCredentialService.DeleteTenantVaultCredentialAsync(vaultCredentialId));
    }
}
