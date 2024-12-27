namespace WorkspaceAPIs.Repos;

public interface IFlowVersionRepo : IRepositoryBase<FlowVersion, WorkspaceDbContext>
{
    /// <summary>
    /// Get count of flow version entries based on flow identifier
    /// </summary>
    /// <param name="flowId"></param>
    /// <returns>Count of flow versions</returns>
    Task<int> GetFlowVersionCountAsync(Guid flowId);
}