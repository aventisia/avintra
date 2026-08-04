namespace WorkspaceAPIs.Services;

public interface IExecutionGraphService
{
    Task<ServiceResponse<ExecutionGraphDto>> GetExecutionGraphAsync(Guid jobId);
}
