namespace WorkspaceAPIs.Repos;

public class FlowVersionHistoryRepo : RepositoryBase<FlowVersionHistory, WorkspaceDbContext>, IFlowVersionHistoryRepo
{
    public FlowVersionHistoryRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}