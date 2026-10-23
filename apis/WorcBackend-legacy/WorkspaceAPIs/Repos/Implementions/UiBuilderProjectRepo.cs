namespace WorkspaceAPIs.Repos;

public class UiBuilderProjectRepo : RepositoryBase<UiBuilderProject, WorkspaceDbContext>, IUiBuilderProjectRepo
{
    public UiBuilderProjectRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
