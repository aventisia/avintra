namespace WorkspaceAPIs.Repos;

public class VaultCredentialRepo : RepositoryBase<VaultCredential, WorkspaceDbContext>, IVaultCredentialRepo
{
    public VaultCredentialRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }

    public async Task<Dictionary<Guid, (string Name, bool IsTenantScope)>> GetProviderCredentialNamesAsync(IReadOnlyCollection<Guid> credentialIds, Guid tenantId, ConfigureEnvironmentType envType)
    {
        var names = new Dictionary<Guid, (string Name, bool IsTenantScope)>();
        if (credentialIds.Count == 0) return names;

        var tenantCredentials = await _tDbContext.VaultCredentials
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(w => credentialIds.Contains(w.Id) && w.TenantId == tenantId && w.Scope == VaultCredentialScopeEnum.Tenant)
            .Select(w => new { w.Id, w.Name })
            .ToListAsync();

        var spaceCredentials = await _tDbContext.VaultCredentials
            .AsNoTracking()
            .Where(w => credentialIds.Contains(w.Id) && w.EnvType == envType)
            .Select(w => new { w.Id, w.Name })
            .ToListAsync();

        foreach (var credential in spaceCredentials) names[credential.Id] = (credential.Name, false);
        foreach (var credential in tenantCredentials) names[credential.Id] = (credential.Name, true);

        return names;
    }
}
