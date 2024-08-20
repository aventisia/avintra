namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a data transfer object of record IDs for bulk actions.
/// </summary>
public class RecordIdsDto
{
    /// <summary>
    /// Gets or sets the list of record IDs.
    /// </summary>
    [MinLength(1)]
    public required List<Guid> Ids { get; set; }
}