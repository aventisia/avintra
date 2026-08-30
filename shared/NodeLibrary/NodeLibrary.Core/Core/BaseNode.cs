namespace NodeLibrary.Core;

/// <summary>
/// Base class for all custom nodes
/// This works in .NET 8/10 and provides the same structure as WF CodeActivity
/// </summary>
public abstract class BaseNode
{
    // Common properties for all nodes
    public required InArgument<FlowMetadata> FlowMetadata { get; set; }
    public required InArgument<JobContext> JobContext { get; set; }
    public required InArgument<CallerContext> CallerContext { get; set; }
    public required OutArgument<bool> IsSuccess { get; set; }
    public required OutArgument<string> StatusMessage { get; set; }

    /// <summary>
    /// Runtime-declared outputs whose names are not known at compile time.
    /// Nodes can populate this during execution to emit additional output values
    /// keyed by dynamic names (e.g. the variable name in SetVariableNode).
    /// </summary>
    public Dictionary<string, object?> DynamicOutputs { get; } = new();

    /// <summary>
    /// Synchronous execute method. Override this for synchronous nodes.
    /// </summary>
    protected virtual void Execute(INodeContext context) { }

    /// <summary>
    /// Asynchronous execute method. Override this for async nodes.
    /// Default implementation delegates to the synchronous Execute method.
    /// </summary>
    protected virtual Task ExecuteAsync(INodeContext context)
    {
        Execute(context);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Internal method called by the executor (synchronous)
    /// </summary>
    internal void InternalExecute(INodeContext context)
    {
        Execute(context);
    }

    /// <summary>
    /// Internal method called by the executor (asynchronous)
    /// </summary>
    internal Task InternalExecuteAsync(INodeContext context)
    {
        return ExecuteAsync(context);
    }
}