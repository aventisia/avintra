namespace WorkspaceAPIs.Repos;

public class BlockRepo : RepositoryBase<Block, WorkspaceDbContext>, IBlockRepo
{
    public BlockRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}