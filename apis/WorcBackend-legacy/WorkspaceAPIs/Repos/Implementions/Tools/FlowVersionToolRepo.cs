namespace WorkspaceAPIs.Repos;

public class FlowVersionToolRepo : RepositoryBase<FlowVersion_Tool, WorkspaceDbContext>, IFlowVersionToolRepo
{
    public FlowVersionToolRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
