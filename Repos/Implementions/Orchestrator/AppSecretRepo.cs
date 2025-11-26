namespace WorkspaceAPIs.Repos;

public class AppSecretRepo : RepositoryBase<AppSecret, WorkspaceDbContext>, IAppSecretRepo
{
    public AppSecretRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}