namespace WorkspaceAPIs.Repos;

public class FlowVersionRepo : RepositoryBase<FlowVersion, WorkspaceDbContext>, IFlowVersionRepo
{
    public FlowVersionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}