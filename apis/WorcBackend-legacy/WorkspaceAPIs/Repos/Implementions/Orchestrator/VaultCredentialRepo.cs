namespace WorkspaceAPIs.Repos;

public class VaultCredentialRepo : RepositoryBase<VaultCredential, WorkspaceDbContext>, IVaultCredentialRepo
{
    public VaultCredentialRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}