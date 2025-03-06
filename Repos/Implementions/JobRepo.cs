namespace WorkspaceAPIs.Repos;

public class JobRepo : RepositoryBase<Job, WorkspaceDbContext>, IJobRepo
{
    public JobRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}