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
    /// <param name="machineId">Optional machine identifier to filter flow versions linked to it.</param>
    /// <returns>A list of select options representing flow versions that match the search criteria.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionSelectOption>>> SearchFlowVersionAsync(string searchKey, FlowTypesEnum type, bool includePublishedOnly, Guid? machineId);

    /// <summary>
    /// Searches machines by unique machine name with an optional flow version filter.
    /// NOTE: At least one of <paramref name="searchKey"/> or <paramref name="flowVersionId"/> must be provided.
    /// If only <paramref name="flowVersionId"/> is provided, all machines linked to that flow version are returned.
    /// If only <paramref name="searchKey"/> is provided, machines are matched by name without filtering by flow version.
    /// </summary>
    /// <param name="searchKey">The search key to filter machines by unique name.</param>
    /// <param name="flowVersionId">Optional flow version identifier to filter machines linked to it.</param>
    /// <returns>A list of select options representing machines that match the search criteria.</returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> SearchMachineAsync(string? searchKey, Guid? flowVersionId);
}
