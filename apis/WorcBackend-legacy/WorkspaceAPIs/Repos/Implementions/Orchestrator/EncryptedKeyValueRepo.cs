namespace WorkspaceAPIs.Repos;

public class EncryptedKeyValueRepo : RepositoryBase<EncryptedKeyValue, WorkspaceDbContext>, IEncryptedKeyValueRepo
{
    public EncryptedKeyValueRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}