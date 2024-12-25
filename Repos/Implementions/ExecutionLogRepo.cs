namespace WorkspaceAPIs.Repos;

public class ExecutionLogRepo : RepositoryBase<ExecutionLog, WorkspaceDbContext>, IExecutionLogRepo
{
    public ExecutionLogRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}