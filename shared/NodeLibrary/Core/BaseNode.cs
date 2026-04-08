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
    /// Execute method that derived classes must implement
    /// </summary>
    protected abstract void Execute(INodeContext context);

    /// <summary>
    /// Internal method called by the executor
    /// </summary>
    internal void InternalExecute(INodeContext context)
    {
        Execute(context);
    }
}