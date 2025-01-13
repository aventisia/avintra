namespace WorkspaceAPIs.Repos;

public class FlowLogRepo : RepositoryBase<FlowLog,WorkspaceDbContext> ,IFlowLogRepo
{
    public FlowLogRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}