namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a selectable option in a dropdown or selection list.
/// </summary>
public class SelectOptionDto
{
    /// <summary>
    /// Gets or sets the actual data which will be saved in the database on selection.
    /// </summary>
    public required string Label { get; set; }

    /// <summary>
    /// Gets or sets the label for the value, which will be visible for the user.
    /// </summary>
    public required string Value { get; set; }

    /// <summary>
    /// Gets or sets the description for the label if the user needs more information to select.
    /// </summary>
    public string? Description { get; set; }
}
