namespace WorkspaceAPIs.Repos;

public class NotificationRepo : RepositoryBase<Notification, WorkspaceDbContext>, INotificationRepo
{
    private readonly IMapper _mapper;

    public NotificationRepo(WorkspaceDbContext workspaceDbContext, IMapper mapper) : base(workspaceDbContext)
    {
        _mapper = mapper;
    }
}