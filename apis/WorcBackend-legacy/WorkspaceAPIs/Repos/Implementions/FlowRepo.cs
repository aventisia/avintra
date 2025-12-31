namespace WorkspaceAPIs.Repos;

public class FlowRepo : RepositoryBase<Flow, WorkspaceDbContext>, IFlowRepo
{
    public FlowRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}