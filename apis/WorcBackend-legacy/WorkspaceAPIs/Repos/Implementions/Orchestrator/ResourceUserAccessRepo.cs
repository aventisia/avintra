namespace WorkspaceAPIs.Repos;

public class ResourceUserAccessRepo : RepositoryBase<ResourceUserAccess, WorkspaceDbContext>, IResourceUserAccessRepo
{
    public ResourceUserAccessRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}