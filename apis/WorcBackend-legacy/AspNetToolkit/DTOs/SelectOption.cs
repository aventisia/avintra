namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a selectable option in a dropdown or selection list.
/// </summary>
public class SelectOption
{
    /// <summary>
    /// Gets or sets the label visible to the user in a dropdown or selection list.
    /// </summary>
    public required string Label { get; set; }

    /// <summary>
    /// Gets or sets the actual data value saved in the database on selection.
    /// </summary>
    public required string Value { get; set; }

    /// <summary>
    /// Gets or sets the description for the label if the user needs more information to select.
    /// </summary>
    public string? Description { get; set; }
}
