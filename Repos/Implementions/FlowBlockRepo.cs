namespace WorkspaceAPIs.Repos;

public class FlowBlockRepo : RepositoryBase<FlowBlock, WorkspaceDbContext>, IFlowBlockRepo
{
    public FlowBlockRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}