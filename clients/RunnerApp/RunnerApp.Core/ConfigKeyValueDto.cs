namespace RunnerApp.Services;

/// <summary>
/// Key/value pair returned by the workspace key-store/fetch endpoint.
/// Mirrors WorkspaceAPIs.DTOs.ConfigKeyValueDto so RunnerApp does not need a project reference.
/// </summary>
public class ConfigKeyValueDto
{
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;
}
