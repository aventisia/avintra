namespace WorkspaceAPIs.Services;

public interface IExecuteFlowService
{
    /// <summary>
    /// Endpoint to execute the flow version on web. If flow version is unpublished, 
    /// it checks all the validations to ensure only valid flow graph can be 
    /// executed. If flow version is published, it will not validate the flow 
    /// graph since published flow versions are non editable and all validation 
    /// checks should have been passed at the time of publishing.
    /// </summary>
    Task<ServiceResponse<ExecuteFlowResponseDto>> ExecuteFlowAsync(ExecuteFlowRequestDto requestDto);
}
