namespace WorkspaceAPIs.Repos;

public class WorkspaceUserRepo : RepositoryBase<WorkspaceUser, WorkspaceDbContext>, IWorkspaceUserRepo
{
    public WorkspaceUserRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}