namespace WorkspaceAPIs.Repos;

public class UiBuilderProjectUserRepo : RepositoryBase<UiBuilderProjectUser, WorkspaceDbContext>, IUiBuilderProjectUserRepo
{
    public UiBuilderProjectUserRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
