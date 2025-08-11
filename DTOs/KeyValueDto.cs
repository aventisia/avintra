namespace AspNetToolkit.DTOs;

/// <summary>
/// Data Transfer Object representing a key-value pair, 
/// typically used for transmitting encrypted configuration values.
/// </summary>
public class KeyValueDto
{
    /// <summary>
    /// The name of the property or configuration key.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// The associated (possibly encrypted) value.
    /// </summary>
    public required string Value { get; set; } = string.Empty;
}
