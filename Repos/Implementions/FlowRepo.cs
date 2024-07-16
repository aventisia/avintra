namespace WorkspaceAPIs.Repos;

public class FlowRepo : RepositoryBase<Flow, WorkspaceDbContext>, IFlowRepo
{
    private readonly IMapper _mapper;

    public FlowRepo(WorkspaceDbContext workspaceDbContext, IMapper mapper) : base(workspaceDbContext)
    {
        _mapper = mapper;
    }
}