namespace NodeLibrary.Attributes;

/// <summary>
/// Provides metadata for node classes in the NodeLibrary
/// </summary>
[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public class NodeMetadataAttribute : Attribute
{
    /// <summary>
    /// Type of the node (e.g., "activityNode")
    /// </summary>
    public string NodeType { get; }

    /// <summary>
    /// Version of the node
    /// </summary>
    public string Version { get; }

    /// <summary>
    /// Author of the node
    /// </summary>
    public string Author { get; }

    /// <summary>
    /// Possible value (single value): "standard", "none"
    /// </summary>
    public string ErrorHandling { get; }

    /// <summary>
    /// Possible value (single value): "standard", "none", "llmGenerateRequest"
    /// </summary>
    public string TestScreenType { get; }

    /// <summary>
    /// Icon path for the node (typically a small icon)
    /// </summary>
    public string Icon { get; }

    /// <summary>
    /// Documentation link for the node
    /// </summary>
    public string DocsLink { get; }

    /// <summary>
    /// Possible values (one or more separated by comma): "windows", "cloud", "cloud,windows"
    /// Same property also exists in NodeCategoryMetadataAttribute and if needed then we can override it on node level. 
    /// If not set on node level then we can take the value from category level.
    /// </summary>
    public string? SupportedPlatforms { get; }

    /// <summary>
    /// Possible values (one or more separated by comma): "production" or "commercial" or "enterprise" or "production,enterprise" etc
    /// </summary>
    public string? DoNotRenderIf { get; }

    /// <summary>
    /// Optional badge to display next to the node label (e.g., "Beta"). Null or empty means no badge.
    /// </summary>
    public string? Badge { get; }

    public NodeMetadataAttribute(
        string nodeType = "activityNode",
        string version = "1.0.0",
        string author = "@aventisia",
        string errorHandling = "standard",
        string testScreenType = "standard",
        string icon = "/function.png",
        string docsLink = "https://docs.aventisia.com",
        string? supportedPlatforms = null,
        string? doNotRenderIf = null,
        string? badge = null)
    {
        NodeType = nodeType;
        Version = version;
        Author = author;
        ErrorHandling = errorHandling;
        TestScreenType = testScreenType;
        Icon = icon;
        DocsLink = docsLink;
        SupportedPlatforms = supportedPlatforms;
        DoNotRenderIf = doNotRenderIf;
        Badge = badge;
    }
}