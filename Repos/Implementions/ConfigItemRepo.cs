namespace WorkspaceAPIs.Repos;

public class ConfigItemRepo : RepositoryBase<ConfigItem, WorkspaceDbContext>, IConfigItemRepo
{
    public ConfigItemRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}