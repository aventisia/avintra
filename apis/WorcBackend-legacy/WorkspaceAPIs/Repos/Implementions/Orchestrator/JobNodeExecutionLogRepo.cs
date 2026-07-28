namespace WorkspaceAPIs.Repos;

public class JobNodeExecutionLogRepo : RepositoryBase<JobNodeExecutionLog, WorkspaceDbContext>, IJobNodeExecutionLogRepo
{
    public JobNodeExecutionLogRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
