namespace WorkspaceAPIs.Services;
 public class FlowTemplateRepo :RepositoryBase<FlowTemplate, WorkspaceDbContext>, IFlowTemplateRepo
{
    public FlowTemplateRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}
