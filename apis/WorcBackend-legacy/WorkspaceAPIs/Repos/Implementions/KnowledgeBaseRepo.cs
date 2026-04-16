namespace WorkspaceAPIs.Repos;

public class KnowledgeBaseRepo : RepositoryBase<KnowledgeBase, WorkspaceDbContext>, IKnowledgeBaseRepo
{
    public KnowledgeBaseRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}
