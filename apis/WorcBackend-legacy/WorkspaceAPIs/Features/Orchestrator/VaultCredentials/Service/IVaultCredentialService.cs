namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations for managing vault credentials in a multi-tenant environment.
/// </summary>
public interface IVaultCredentialService
{
    /// <summary>Retrieves list of vault credentials.</summary>
    Task<ServiceResponse<IEnumerable<VaultCredentialDto>>> GetAllVaultCredentialsAsync(bool isPersonal);

    /// <summary>Checks whether a vault credential name is available.</summary>
    Task<ServiceResponse<TrueFalseResultDto>> IsVaultCredentialNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>Retrieves vault credentials as selectable options.</summary>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableVaultCredentialOptionsAsync(VaultCredentialTypesEnum? type);

    /// <summary>Retrieves a vault credential by its ID.</summary>
    Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialByIdAsync(Guid vaultCredentialId);

    /// <summary>Retrieves a vault credential by its name.</summary>
    Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialByNameAsync(string vaultCredentialName);

    /// <summary>Insert a new vault credential.</summary>
    Task<ServiceResponse<VaultCredentialDto>> CreateVaultCredentialAsync(VaultCredentialDto vaultCredentialDto);

    /// <summary>Updates an existing vault credential.</summary>
    Task<ServiceResponse<VaultCredentialDto>> UpdateVaultCredentialAsync(VaultCredentialDto vaultCredentialDto);

    /// <summary>Deletes an existing vault credential.</summary>
    Task<ServiceResponse<bool>> DeleteVaultCredentialAsync(Guid vaultCredentialId);

    /// <summary>Deletes multiple vault credentials by their IDs.</summary>
    Task<ServiceResponse<int>> DeleteVaultCredentialsAsync(List<Guid> vaultCredentialIds);

    /// <summary>Retrieves a vault credential with decrypted values by its ID.</summary>
    Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialDetailAsync(Guid vaultCredentialId);

    /// <summary>Retrieves a vault credential with decrypted values by its name.</summary>
    Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialDetailByNameAsync(string vaultCredentialName, TenantCredentialAccessEnum tenantAccess = TenantCredentialAccessEnum.None);

    /// <summary>Retrieves the tenant-level vault credentials with no secret values.</summary>
    Task<ServiceResponse<IEnumerable<VaultCredentialDto>>> GetTenantVaultCredentialsAsync();

    /// <summary>Retrieves tenant-level vault credentials as selectable options.</summary>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableTenantVaultCredentialOptionsAsync(VaultCredentialTypesEnum? type);

    /// <summary>Checks whether a name is free across every tenant credential.</summary>
    Task<ServiceResponse<TrueFalseResultDto>> IsTenantVaultCredentialNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>Inserts a new tenant-level vault credential.</summary>
    Task<ServiceResponse<VaultCredentialDto>> InsertTenantVaultCredentialAsync(VaultCredentialDto vaultCredentialDto);

    /// <summary>Updates an existing tenant-level vault credential.</summary>
    Task<ServiceResponse<VaultCredentialDto>> UpdateTenantVaultCredentialAsync(VaultCredentialDto vaultCredentialDto);

    /// <summary>Deletes a tenant-level vault credential unless a model provider uses it.</summary>
    Task<ServiceResponse<bool>> DeleteTenantVaultCredentialAsync(Guid vaultCredentialId);

    /// <summary>Creates a Corsair OAuth connect link for a vault credential.</summary>
    Task<ServiceResponse<CorsairConnectLink>> CreateOAuthConnectLinkAsync(Guid vaultCredentialId);

    /// <summary>Retrieves the Corsair OAuth connection status for a vault credential.</summary>
    Task<ServiceResponse<CorsairConnectionStatus>> GetOAuthConnectionStatusAsync(Guid vaultCredentialId);

    /// <summary>Tests a Corsair vault credential connection.</summary>
    Task<ServiceResponse<CorsairCredentialTestResult>> TestCorsairCredentialAsync(Guid vaultCredentialId);

    /// <summary>Mirrors a stored vault credential to the Corsair sidecar.</summary>
    Task<bool> SyncCredentialToCorsairAsync(Guid vaultCredentialId);
}
