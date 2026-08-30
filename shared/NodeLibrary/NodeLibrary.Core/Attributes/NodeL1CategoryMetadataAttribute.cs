namespace NodeLibrary.Attributes;

/// <summary>
/// Provides metadata for node level 1 categories in the NodeLibrary
/// </summary>
[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public class NodeL1CategoryMetadataAttribute : Attribute
{
    public string Label { get; }
    public string Description { get; }
    public string Icon { get; }

    public NodeL1CategoryMetadataAttribute(
        string label,
        string description,
        string icon = "/function.png")
    {
        Label = label;
        Description = description;
        Icon = icon;
    }
}
