namespace WorkspaceAPIs.Repos;

public class FlowCommentRepo : RepositoryBase<FlowComment, WorkspaceDbContext>, IFlowCommentRepo
{
    private readonly IMapper _mapper;

    public FlowCommentRepo(WorkspaceDbContext workspaceDbContext, IMapper mapper) : base(workspaceDbContext)
    {
        _mapper = mapper;
    }
}