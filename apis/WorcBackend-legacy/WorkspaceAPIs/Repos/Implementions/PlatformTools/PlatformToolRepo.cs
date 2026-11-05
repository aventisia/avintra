namespace WorkspaceAPIs.Repos;

public class PlatformToolRepo : RepositoryBase<PlatformTool, WorkspaceDbContext>, IPlatformToolRepo
{
    public PlatformToolRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
