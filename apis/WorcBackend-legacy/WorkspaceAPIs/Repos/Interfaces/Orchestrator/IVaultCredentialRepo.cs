namespace WorkspaceAPIs.Repos;

public interface IVaultCredentialRepo : IRepositoryBase<VaultCredential, WorkspaceDbContext>
{
    /// <summary>Maps model provider credential ids to names: the tenant's tenant-level rows, or space rows of the current space in <paramref name="envType"/>.</summary>
    Task<Dictionary<Guid, (string Name, bool IsTenantScope)>> GetProviderCredentialNamesAsync(IReadOnlyCollection<Guid> credentialIds, Guid tenantId, ConfigureEnvironmentType envType);
}
