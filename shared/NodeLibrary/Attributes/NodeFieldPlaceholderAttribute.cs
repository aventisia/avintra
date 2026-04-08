namespace NodeLibrary.Attributes;

/// <summary>
/// Indicates the placeholder text for an argument property in the UI.
/// Should only be applied to properties of type InArgument.
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class NodeFieldPlaceholderAttribute : Attribute
{
    public string Placeholder { get; }

    public NodeFieldPlaceholderAttribute(string placeholder)
    {
        Placeholder = placeholder;
    }
}