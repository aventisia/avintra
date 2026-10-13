namespace WorkspaceAPIs.Features.CloudConnectors;

public class VaultCredentialObj
{
    public required string Name { get; set; }

    public VaultCredentialTypesEnum Type { get; set; }

    public required Dictionary<string, object> Data { get; set; }
}