namespace WorkspaceAPIs.Features.CloudConnectors;

public interface ICloudConnectorsVaultCredentialService
{
    /// <summary>
    /// Asynchronously resolves a connector credential and the exact reason when it cannot be used.
    /// </summary>
    /// <param name="credentialName">The name of the credential to resolve.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="CredentialResolution"/>.</returns>
    Task<CredentialResolution> ResolveVaultCredentialAsync(string credentialName);
}
