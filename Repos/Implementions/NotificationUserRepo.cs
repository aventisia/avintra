namespace WorkspaceAPIs.Repos;

public class NotificationUserRepo : RepositoryBase<NotificationUser, WorkspaceDbContext>, INotificationUserRepo
{
    public NotificationUserRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}