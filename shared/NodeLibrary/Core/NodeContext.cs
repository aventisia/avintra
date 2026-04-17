namespace NodeLibrary.Core;

/// <summary>
/// Interface for node execution context
/// </summary>
public interface INodeContext
{
    T GetValue<T>(InArgument<T> argument);
    void SetValue<T>(OutArgument<T> argument, T value);

    // Add any additional context methods you need
    Dictionary<string, object> Properties { get; }
}

/// <summary>
/// Concrete implementation of node context
/// </summary>
public class NodeContext : INodeContext
{
    public Dictionary<string, object> Properties { get; private set; }

    public NodeContext()
    {
        Properties = new Dictionary<string, object>();
    }

    public T GetValue<T>(InArgument<T> argument)
    {
        var result = argument.Get(this);
        return result is not null ? result : default!;
    }

    public void SetValue<T>(OutArgument<T> argument, T value)
    {
        argument.Set(this, value);
    }
}