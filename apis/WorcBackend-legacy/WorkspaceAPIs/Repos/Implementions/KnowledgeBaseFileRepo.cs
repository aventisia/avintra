namespace WorkspaceAPIs.Repos;

public class KnowledgeBaseFileRepo : RepositoryBase<KnowledgeBaseFile, WorkspaceDbContext>, IKnowledgeBaseFileRepo
{
    public KnowledgeBaseFileRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}
