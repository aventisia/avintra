namespace WorkspaceAPIs.Services;
 public class ProjectTemplateRepo :RepositoryBase<ProjectTemplate, WorkspaceDbContext>, IProjectTemplateRepo
{
    public ProjectTemplateRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}
