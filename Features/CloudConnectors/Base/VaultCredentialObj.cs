namespace WorkspaceAPIs.Features.CloudConnectors;

public class VaultCredentialObj
{
    public required string Name { get; set; }

    public AppSecretTypesEnum Type { get; set; }

    public required Dictionary<string, object> Data { get; set; }
}