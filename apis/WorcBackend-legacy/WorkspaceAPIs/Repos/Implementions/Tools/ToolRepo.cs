namespace WorkspaceAPIs.Repos;

public class ToolRepo : RepositoryBase<Tool, WorkspaceDbContext>, IToolRepo
{
    public ToolRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
