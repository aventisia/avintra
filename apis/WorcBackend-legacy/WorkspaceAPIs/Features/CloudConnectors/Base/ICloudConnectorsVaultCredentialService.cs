namespace WorkspaceAPIs.Features.CloudConnectors;

public interface ICloudConnectorsVaultCredentialService
{
    /// <summary>
    /// Asynchronously retrieves a credential object from the vault using the specified credential name.
    /// </summary>
    /// <param name="credentialName">The name of the credential to retrieve from the vault.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="VaultCredentialObj"/> retrieved from the vault.</returns>
    Task<VaultCredentialObj?> GetVaultCredentialAsync(string credentialName);
}

