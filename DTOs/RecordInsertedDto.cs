namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a data transfer object to send primary key of a newly inserted record.
/// </summary>
public class RecordInsertedDto
{
    /// <summary>
    /// Gets or sets the primary key of the newly created record.
    /// </summary>
    public Guid Id { get; set; }
}