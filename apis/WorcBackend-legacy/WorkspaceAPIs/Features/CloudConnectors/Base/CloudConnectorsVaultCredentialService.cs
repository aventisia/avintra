namespace WorkspaceAPIs.Features.CloudConnectors;

public class CloudConnectorsVaultCredentialService : ICloudConnectorsVaultCredentialService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CloudConnectorsVaultCredentialService> _logger;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceUserAccessService _resourceUserAccessService;

    public CloudConnectorsVaultCredentialService(
        IUnitOfWork unitOfWork,
        ILogger<CloudConnectorsVaultCredentialService> logger,
        IStringEncryptionService stringEncryptionService,
        ICurrentTenantService currentTenantService,
        IResourceUserAccessService resourceUserAccessService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _stringEncryptionService = stringEncryptionService;
        _currentTenantService = currentTenantService;
        _resourceUserAccessService = resourceUserAccessService;
    }

    public async Task<VaultCredentialObj?> GetVaultCredentialAsync(string credentialName)
    {
        try
        {
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

            var currentUserId = _currentTenantService.CurrentUserId;
            if (!await CanUseCredentialAsync(vaultCredential, currentUserId))
            {
                _logger.LogWarning(
                    "Denied vault access to credential {CredentialName} for user {UserId}.",
                    credentialName,
                    currentUserId);
                return null;
            }

            var decryptedData = new Dictionary<string, string>();
            foreach (var kvp in vaultCredential.EncryptedKeyValues)
            {
                var decryptedValue = _stringEncryptionService.DecryptString(kvp.Value);
                decryptedData[kvp.Name] = decryptedValue;
            }

            // IMPORTANT NOTE: CustomApiTool vault secrets nest their values under "Parameters", while every other
            // credential type keeps them at the top level; both shapes must be merged or nested secrets are dropped.
            var dataNode = (string.IsNullOrEmpty(vaultCredential.Data)
                ? null
                : System.Text.Json.Nodes.JsonNode.Parse(vaultCredential.Data)) as System.Text.Json.Nodes.JsonObject
                ?? new System.Text.Json.Nodes.JsonObject();

            foreach (var kvp in decryptedData)
            {
                var parameters = dataNode["Parameters"] as System.Text.Json.Nodes.JsonObject;

                if (parameters is not null && (parameters.ContainsKey(kvp.Key) || !dataNode.ContainsKey(kvp.Key)))
                {
                    parameters[kvp.Key] = kvp.Value;
                }
                else
                {
                    dataNode[kvp.Key] = kvp.Value;
                }
            }

            var dataDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(dataNode.ToJsonString())
                ?? new Dictionary<string, object>();

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

    private async Task<bool> CanUseCredentialAsync(VaultCredential credential, Guid currentUserId)
    {
        // IMPORTANT NOTE: unauthenticated HTTP callers receive a random user id, so an empty id means the
        // call did not originate from an authorized request and must not fall back to unrestricted access.
        if (currentUserId == Guid.Empty)
        {
            return false;
        }

        if (credential.CreatedByUserId == currentUserId || credential.IsTenantWideAccess)
        {
            return true;
        }

        var (hasAccess, _) = await _resourceUserAccessService.GetResourceAccessAsync(
            currentUserId,
            credential.Id,
            ResourceTypeEnum.VaultCredential,
            credential.CreatedByUserId,
            credential.IsTenantWideAccess,
            ResourceAccessTypeEnum.Owner,
            ResourceAccessTypeEnum.View,
            ResourceAccessTypeEnum.Edit);

        return hasAccess;
    }
}
