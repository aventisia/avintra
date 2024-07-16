namespace WorkspaceAPIs.Repos;

public class NotificationUserRepo : RepositoryBase<NotificationUser, WorkspaceDbContext>, INotificationUserRepo
{
    private readonly IMapper _mapper;

    public NotificationUserRepo(WorkspaceDbContext workspaceDbContext, IMapper mapper) : base(workspaceDbContext)
    {
        _mapper = mapper;
    }
}