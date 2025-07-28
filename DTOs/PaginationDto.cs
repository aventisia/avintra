namespace AspNetToolkit.DTOs;

/// <summary>
/// A generic DTO that encapsulates the results of a paginated query.
/// </summary>
/// <typeparam name="T">The type of objects in the paginated result set.</typeparam>
public class PaginationDto<T>
{
    /// <summary>
    /// The list of items on the current page.
    /// </summary>
    public IEnumerable<T> Items { get; set; } = new List<T>();

    /// <summary>
    /// The current page number (1-based index).
    /// </summary>
    public int PageNo { get; set; }

    /// <summary>
    /// The number of items displayed per page.
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// The total number of items in the entire dataset.
    /// </summary>
    public int Total { get; set; }
}
