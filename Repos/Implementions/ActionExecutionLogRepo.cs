namespace WorkspaceAPIs.Repos;

public class ActionExecutionLogRepo : RepositoryBase<ActionExecutionLog, WorkspaceDbContext>, IActionExecutionLogRepo
{
    public ActionExecutionLogRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}