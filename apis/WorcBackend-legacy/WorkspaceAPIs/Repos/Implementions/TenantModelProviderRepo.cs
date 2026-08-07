namespace WorkspaceAPIs.Repos;

public class TenantModelProviderRepo : RepositoryBase<TenantModelProvider, WorkspaceDbContext>, ITenantModelProviderRepo
{
    public TenantModelProviderRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}
