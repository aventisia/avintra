namespace NodeLibrary.Core;

/// <summary>
/// Base class for node arguments
/// </summary>
public abstract class NodeArgument
{
    public Type? ArgumentType { get; protected set; }
    internal object? Value { get; set; }
}

/// <summary>
/// Input argument for nodes (replaces InArgument<T>)
/// </summary>
public class InArgument<T> : NodeArgument
{
    public InArgument()
    {
        ArgumentType = typeof(T);
    }

    public InArgument(T value) : this()
    {
        Value = value;
    }

    public T? Get(INodeContext context)
    {
        if (Value == null)
            return default;

        // If it's already the correct type, return it
        if (Value is T typedValue)
            return typedValue;

        // Try to convert
        try
        {
            return (T)Convert.ChangeType(Value, typeof(T));
        }
        catch
        {
            return default;
        }
    }
}

/// <summary>
/// Output argument for nodes
/// </summary>
public class OutArgument<T> : NodeArgument
{
    public OutArgument()
    {
        ArgumentType = typeof(T);
    }

    public void Set(INodeContext context, T value)
    {
        Value = value;
    }

    public T? Get(INodeContext context)
    {
        if (Value == null)
            return default;

        if (Value is T typedValue)
            return typedValue;

        try
        {
            return (T)Convert.ChangeType(Value, typeof(T));
        }
        catch
        {
            return default;
        }
    }
}