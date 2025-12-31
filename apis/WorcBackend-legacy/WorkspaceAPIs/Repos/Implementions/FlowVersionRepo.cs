namespace WorkspaceAPIs.Repos;

public class FlowVersionRepo : RepositoryBase<FlowVersion, WorkspaceDbContext>, IFlowVersionRepo
{
    public FlowVersionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }

    //Get count of flow version entries based on flow identifier
    public async Task<int> GetFlowVersionCountAsync(Guid flowId)
    {

        var hasVersions = await _tDbContext.FlowVersions
        .AnyAsync(f => f.FlowId == flowId);

        int maxVersion = 0;

        if (hasVersions)
        {
            maxVersion = await _tDbContext.FlowVersions
                .Where(f => f.FlowId == flowId)
                .MaxAsync(f => f.VersionNumber);
        }
        return maxVersion;
    }
}