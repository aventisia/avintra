namespace WorkspaceAPIs.Repos;

public class FlowVersionRepo : RepositoryBase<FlowVersion, WorkspaceDbContext>, IFlowVersionRepo
{
    public FlowVersionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }

    //Get count of flow version entries based on flow identifier
    public async Task<int> GetFlowVersionCountAsync(Guid flowId)
    {
        return await _tDbContext.FlowVersions.Where(f => f.FlowId == flowId).CountAsync();
    }
}