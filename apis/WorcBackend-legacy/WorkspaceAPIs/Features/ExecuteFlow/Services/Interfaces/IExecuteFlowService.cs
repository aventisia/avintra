namespace WorkspaceAPIs.Services;

public interface IExecuteFlowService
{
    Task<ServiceResponse<ExecuteFlowResponseDto>> ExecuteFlowAsync(ExecuteFlowRequestDto requestDto);
}
