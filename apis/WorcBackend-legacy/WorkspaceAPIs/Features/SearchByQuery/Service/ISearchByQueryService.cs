namespace WorkspaceAPIs.Services;

public interface ISearchByQueryService
{
    /// <summary>
    /// Searches flow versions.
    /// NOTE: The search key is used to filter flows by name. If the search key is null or empty, top 10 accessible flows (ordered by name) are considered.
    /// </summary>
    /// <param name="searchKey">The search key to filter flows by name.</param>
    /// <param name="type">The type of the flow.</param>
    /// <param name="includePublishedOnly">Whether to include only published flow versions.</param>
    /// <returns>A list of flow versions that match the search criteria.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionSearchResultDto>>> SearchFlowVersionAsync(string searchKey, FlowTypesEnum type, bool includePublishedOnly);
}
