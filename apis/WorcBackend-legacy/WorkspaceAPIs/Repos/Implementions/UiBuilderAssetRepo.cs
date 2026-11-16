namespace WorkspaceAPIs.Repos;

public class UiBuilderAssetRepo : RepositoryBase<UiBuilderAsset, WorkspaceDbContext>, IUiBuilderAssetRepo
{
    public UiBuilderAssetRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
