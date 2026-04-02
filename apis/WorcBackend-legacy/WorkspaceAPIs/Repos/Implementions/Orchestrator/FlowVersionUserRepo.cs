namespace WorkspaceAPIs.Repos;

public class FlowVersionUserRepo : RepositoryBase<FlowVersionUser, WorkspaceDbContext>, IFlowVersionUserRepo
{
    public FlowVersionUserRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}