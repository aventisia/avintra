namespace WorkspaceAPIs.Repos;

public class ResourceShareRepo : RepositoryBase<ResourceShare, WorkspaceDbContext>, IResourceShareRepo
{
    public ResourceShareRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}