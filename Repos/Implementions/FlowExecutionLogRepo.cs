namespace WorkspaceAPIs.Repos;

public class FlowExecutionLogRepo : RepositoryBase<FlowExecutionLog, WorkspaceDbContext>, IFlowExecutionLogRepo
{
    public FlowExecutionLogRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}