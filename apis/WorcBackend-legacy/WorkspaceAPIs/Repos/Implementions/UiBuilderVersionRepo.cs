namespace WorkspaceAPIs.Repos;

public class UiBuilderVersionRepo : RepositoryBase<UiBuilderVersion, WorkspaceDbContext>, IUiBuilderVersionRepo
{
    public UiBuilderVersionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
