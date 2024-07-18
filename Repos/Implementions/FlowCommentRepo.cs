namespace WorkspaceAPIs.Repos;

public class FlowCommentRepo : RepositoryBase<FlowComment, WorkspaceDbContext>, IFlowCommentRepo
{
    public FlowCommentRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}