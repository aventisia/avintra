namespace WorkspaceAPIs.Repos;

public class WorkspaceUserRepo : RepositoryBase<WorkspaceUser, WorkspaceDbContext>, IWorkspaceUserRepo
{
    private readonly IMapper _mapper;

    public WorkspaceUserRepo(WorkspaceDbContext workspaceDbContext, IMapper mapper) : base(workspaceDbContext)
    {
        _mapper = mapper;
    }
}