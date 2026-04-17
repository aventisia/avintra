using ExecutorLibrary.FlowProcessor.Models;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Services;

public interface IFlowExecutionService
{
    /// <summary>
    /// Starts the execution of a flow in the background. This method returns immediately and does not wait for the flow execution to complete.
    /// </summary>
    /// <param name="tenantId">The ID of the tenant under which the flow is being executed.</param>
    /// <param name="userId">The ID of the user who initiated the flow execution.</param>
    /// <param name="jobId">The ID of the job representing the flow execution.</param>
    /// <param name="flow">The flow data model to be executed.</param>
    /// <remarks>
    /// TenantId is required to set the correct scoped services else we won't be able to access tenant specific data during flow execution.
    void StartExecution(Guid tenantId, Guid userId, Guid jobId, ReactFlowDataModel flow, string accessToken);

    /// <summary>
    /// Executes a flow synchronously and returns the result. Used for chat-triggered flows where the caller needs the output inline.
    /// </summary>
    Task<FlowExecutionResult> StartExecutionAndWaitAsync(Guid tenantId, Guid userId, Guid jobId, ReactFlowDataModel flow, string accessToken);
}
