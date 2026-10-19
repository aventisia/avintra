namespace WorkspaceAPIs.Repos;

public class ResourceFlowAccessRepo : RepositoryBase<ResourceFlowAccess, WorkspaceDbContext>, IResourceFlowAccessRepo
{
    public ResourceFlowAccessRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
