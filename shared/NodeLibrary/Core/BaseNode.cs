namespace NodeLibrary.Core;

/// <summary>
/// Base class for all custom nodes
/// This works in .NET 8/10 and provides the same structure as WF CodeActivity
/// </summary>
public abstract class BaseNode
{
    // Common properties for all nodes
    public required InArgument<string> AgentId { get; set; }
    public required InArgument<string> AgentName { get; set; }
    public required InArgument<string> AccessToken { get; set; }
    public required OutArgument<bool> IsSuccess { get; set; }
    public required OutArgument<string> StatusMessage { get; set; }

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