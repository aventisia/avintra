namespace WorkspaceAPIs.Repos;

public class SkillFileRepo : RepositoryBase<SkillFile, WorkspaceDbContext>, ISkillFileRepo
{
    public SkillFileRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
