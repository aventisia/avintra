namespace WorkspaceAPIs.Repos;

public class ProjectRepo : RepositoryBase<Project, WorkspaceDbContext>, IProjectRepo
{
    public ProjectRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}