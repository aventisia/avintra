namespace WorkspaceAPIs.Repos;

public class VectorStoreRepo : RepositoryBase<VectorStore, WorkspaceDbContext>, IVectorStoreRepo
{
    public VectorStoreRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}