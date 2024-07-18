namespace WorkspaceAPIs.Repos;

public class NotificationRepo : RepositoryBase<Notification, WorkspaceDbContext>, INotificationRepo
{
    public NotificationRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}