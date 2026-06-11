namespace WorkspaceAPIs.DTOs;

public class SearchFlowVersionReqDto
{
    /// <summary>
    /// Gets or sets the search key for flow name and version.
    /// </summary>
    public required string SearchKey { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow to filter the search results. Default to Agent type flows.
    /// </summary>
    public FlowTypesEnum Type { get; set; } = FlowTypesEnum.Agent;

    /// <summary>
    /// Gets or sets a value indicating whether to include unpublished versions in the search results.
    /// </summary>
    public bool IncludePublishedOnly { get; set; } = true;
}