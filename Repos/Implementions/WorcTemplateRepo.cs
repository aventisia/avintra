namespace WorkspaceAPIs.Services;
 public class WorcTemplateRepo :RepositoryBase<WorcTemplate, WorkspaceDbContext>, IWorcTemplateRepo
{
    public WorcTemplateRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}
