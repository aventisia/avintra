namespace WorkspaceAPIs.Repos;

public class TenantPlatformToolRepo : RepositoryBase<TenantPlatformTool, WorkspaceDbContext>, ITenantPlatformToolRepo
{
    public TenantPlatformToolRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
