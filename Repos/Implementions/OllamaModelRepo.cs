namespace WorkspaceAPIs.Repos;

public class OllamaModelRepo : RepositoryBase<OllamaModel, WorkspaceDbContext>, IOllamaModelRepo
{
    public OllamaModelRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}