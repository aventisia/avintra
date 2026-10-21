namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object representing a key-value pair, 
/// </summary>
public class ConfigKeyValueDto
{
    public required string Key { get; set; }

    public required string Value { get; set; } = string.Empty;
}
