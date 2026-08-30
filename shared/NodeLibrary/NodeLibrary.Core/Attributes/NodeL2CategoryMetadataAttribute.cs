namespace NodeLibrary.Attributes;

/// <summary>
/// Provides metadata for node level2 categories in the NodeLibrary
/// </summary>
[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public class NodeL2CategoryMetadataAttribute : Attribute
{
    public string Label { get; }
    public string Description { get; }
    public string Icon { get; }

    /// <summary>
    /// Possible values (one or more separated by comma): "windows", "cloud", "cloud,windows". 
    /// We can set this on node category level and then if needed then we can also override it on node level.
    /// </summary>
    public string SupportedPlatforms { get; }

    /// <summary>
    /// Possible values (one or more separated by comma): "production" or "commercial" or "enterprise" or "production,enterprise" etc
    /// </summary>
    public string? DoNotRenderIf { get; }

    public NodeL2CategoryMetadataAttribute(
        string label,
        string description,
        string icon = "/function.png",
        string supportedPlatforms = "cloud,windows",
        string? doNotRenderIf = null)
    {
        Label = label;
        Description = description;
        Icon = icon;
        SupportedPlatforms = supportedPlatforms;
        DoNotRenderIf = doNotRenderIf;
    }
}
