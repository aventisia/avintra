namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorsVaultCredentialService : ICloudConnectorsVaultCredentialService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CloudConnectorsVaultCredentialService> _logger;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly ICurrentTenantService _currentTenantService;

    public CloudConnectorsVaultCredentialService(
        IUnitOfWork unitOfWork,
        ILogger<CloudConnectorsVaultCredentialService> logger,
        IStringEncryptionService stringEncryptionService,
        ICurrentTenantService currentTenantService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _stringEncryptionService = stringEncryptionService;
        _currentTenantService = currentTenantService;
    }

    public async Task<VaultCredentialObj?> GetVaultCredentialAsync(string credentialName)
    {
        try
        {
            // Fetch the credential entity along with its encrypted key-value pairs by NAME.
            // Scoped by Name + TenantId (+ EnvType) so the (credential_name, tenant_id)
            // combination resolves the correct, unique credential.
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.Name == credentialName &&
                    !w.IsDisabled &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();
                
            if (vaultCredential == null) return null;

            // Decrypt and merge key-value pairs into the VaultCredentialObj's data object
            var decryptedData = new Dictionary<string, string>();
            foreach (var kvp in vaultCredential.EncryptedKeyValues)
            {
                var decryptedValue = _stringEncryptionService.DecryptString(kvp.Value);
                decryptedData[kvp.Name] = decryptedValue;
            }

            // Replace the key-value pairs in the Data property where key matches (if vaultCredential is not null then Data property will not be null).
            // Credential types differ in where the encrypted values live: Email and most connectors
            // keep them at the top level, while CustomApiTool nests them under "Parameters". Both
            // shapes must be handled, otherwise nested secrets are silently dropped (leaving empty
            // values that downstream credential readers report as missing).
            var dataNode = (string.IsNullOrEmpty(vaultCredential.Data)
                ? null
                : System.Text.Json.Nodes.JsonNode.Parse(vaultCredential.Data)) as System.Text.Json.Nodes.JsonObject
                ?? new System.Text.Json.Nodes.JsonObject();

            foreach (var kvp in decryptedData)
            {
                if (dataNode["Parameters"] is System.Text.Json.Nodes.JsonObject parameters && parameters.ContainsKey(kvp.Key))
                {
                    parameters[kvp.Key] = kvp.Value;
                }
                else if (dataNode.ContainsKey(kvp.Key))
                {
                    dataNode[kvp.Key] = kvp.Value;
                }
            }

            var dataDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(dataNode.ToJsonString())
                ?? new Dictionary<string, object>();

            // Return the VaultCredentialObj
            return new VaultCredentialObj
            {
                Name = vaultCredential.Name,
                Type = vaultCredential.Type,
                Data = dataDict
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving Credential with Name: {CredentialName}", credentialName);
        }

        return null;
    }
}
