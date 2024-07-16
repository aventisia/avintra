namespace WorkspaceAPIs.Repos;

public class ProjectRepo : RepositoryBase<Project, WorkspaceDbContext>, IProjectRepo
{
    private readonly IMapper _mapper;

    public ProjectRepo(WorkspaceDbContext workspaceDbContext, IMapper mapper) : base(workspaceDbContext)
    {
        _mapper = mapper;
    }
}