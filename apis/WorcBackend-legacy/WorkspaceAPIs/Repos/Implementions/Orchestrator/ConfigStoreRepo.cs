namespace WorkspaceAPIs.Repos;

public class ConfigStoreRepo : RepositoryBase<ConfigStore, WorkspaceDbContext>, IConfigStoreRepo
{
    public ConfigStoreRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}