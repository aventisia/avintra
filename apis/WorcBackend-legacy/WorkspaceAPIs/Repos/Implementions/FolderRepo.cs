namespace WorkspaceAPIs.Repos;

public class FolderRepo : RepositoryBase<Folder, WorkspaceDbContext>, IFolderRepo
{
    public FolderRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
