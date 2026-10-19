namespace AccountsAPIs.Services;

public interface ISearchByQueryService
{
    /// <summary>
    /// Searches tenant users.
    /// NOTE: The search key is matched against first name, last name, and username. If the search key is null or empty, top 10 users (ordered by name) are considered. Space scoping applies only when onlyCurrentSpace is true and a current space is selected; otherwise the search is tenant-wide. A search with no matches returns an empty list.
    /// </summary>
    /// <param name="searchKey">The search key to filter users by name or username.</param>
    /// <param name="includeCurrentUser">Whether to include the current user in the results.</param>
    /// <param name="onlyCurrentSpace">When true, restrict results to active members of the current space; otherwise search tenant-wide.</param>
    /// <returns>A list of users that match the search criteria.</returns>
    Task<ServiceResponse<IEnumerable<SearchedUserDto>>> SearchUserAsync(string? searchKey, bool includeCurrentUser, bool onlyCurrentSpace);
}
