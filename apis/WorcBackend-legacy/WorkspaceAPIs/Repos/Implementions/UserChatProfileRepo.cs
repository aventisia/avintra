namespace WorkspaceAPIs.Repos;

public class UserChatProfileRepo : RepositoryBase<UserChatProfile, WorkspaceDbContext>, IUserChatProfileRepo
{
    public UserChatProfileRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}
