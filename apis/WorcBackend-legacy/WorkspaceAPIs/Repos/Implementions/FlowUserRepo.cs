namespace WorkspaceAPIs.Repos;

public class FlowUserRepo : RepositoryBase<FlowUser, WorkspaceDbContext>, IFlowUserRepo
{
    public FlowUserRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}