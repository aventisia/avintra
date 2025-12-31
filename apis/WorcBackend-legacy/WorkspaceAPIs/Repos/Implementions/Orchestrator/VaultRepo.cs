namespace WorkspaceAPIs.Repos;

public class VaultRepo : RepositoryBase<Vault, WorkspaceDbContext>, IVaultRepo
{
    public VaultRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}