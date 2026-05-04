namespace WorkspaceAPIs.Repos;

public class PromptTemplateRepo : RepositoryBase<PromptTemplate, WorkspaceDbContext>, IPromptTemplateRepo
{
    public PromptTemplateRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}