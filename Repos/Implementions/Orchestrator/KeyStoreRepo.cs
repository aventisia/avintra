namespace WorkspaceAPIs.Repos;

public class KeyStoreRepo : RepositoryBase<KeyStore, WorkspaceDbContext>, IKeyStoreRepo
{
    public KeyStoreRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}