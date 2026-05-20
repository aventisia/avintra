using ExecutorLibrary.FlowProcessor.Models;

namespace WorkspaceAPIs.Services;

public interface IExecuteFlowStep2Service
{
    /// <summary>
    /// Starts the execution of a flow in the background. This method returns immediately and does not wait for the flow execution to complete.
    /// </summary>
    /// <param name="flowExecutionArgs">The model containing all necessary information to start the flow execution.</param>
    /// <remarks>
    /// TenantId is required to set the correct scoped services else we won't be able to access tenant specific data during flow execution.
    void StartExecution(FlowExecutionArgs flowExecutionArgs);

    /// <summary>
    /// Executes a flow synchronously and returns the result. Used for chat-triggered flows where the caller needs the output inline.
    /// </summary>
    Task<FlowExecutionResult> StartExecutionAndWaitAsync(FlowExecutionArgs flowExecutionArgs);
}
