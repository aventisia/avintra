namespace WorkspaceAPIs.Repos;

public class ApiKeyRepo : RepositoryBase<ApiKey, WorkspaceDbContext>, IApiKeyRepo
{
    public ApiKeyRepo(WorkspaceDbContext dbContext) : base(dbContext)
    {
    }
}
