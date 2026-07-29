namespace WorkspaceAPIs.Repos;

public class SkillRepo : RepositoryBase<Skill, WorkspaceDbContext>, ISkillRepo
{
    public SkillRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
