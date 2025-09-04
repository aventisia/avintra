namespace WorkspaceAPIs.Services;
 public class TemplateResourceRepo :RepositoryBase<TemplateResource, WorkspaceDbContext>, ITemplateResourceRepo
{
    public TemplateResourceRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}
