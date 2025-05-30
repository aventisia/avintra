namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Data Transfer Object representing a column with a name and a value.
/// </summary>
public class ColumnsDto
{
    /// <summary>
    /// Gets or sets the name of the column.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value of the column.
    /// </summary>
    public string? Value { get; set; }
}
