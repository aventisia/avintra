namespace WorkspaceAPIs.Features.CloudConnectors.M365;

public class M365ConnectorsService : IM365ConnectorsService
{
    private readonly ILogger<M365ConnectorsService> _logger;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    public string GRAPH_BASE_URL => "https://graph.microsoft.com/v1.0";

    public M365ConnectorsService(
        ILogger<M365ConnectorsService> logger,
        ICloudConnectorsVaultService cloudConnectorsVaultService)
    {
        _logger = logger;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
    }

    public async Task<string?> GetM365AccessTokenAsync(Guid credentialId)
    {
        try
        {
            // Step 1: Get credentials from vault
            var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialId);
            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with ID: {CredentialId} for M365Excel", credentialId);
                return null;
            }

            // Step 2: Validate required credential fields
            if (vaultCredential.Data["AzureTenantId"] == null ||
                vaultCredential.Data["ClientId"] == null ||
                vaultCredential.Data["ClientSecret"] == null)
            {
                _logger.LogWarning("One or more required credential fields are missing for Credential ID: {CredentialId}", credentialId);
                return null;
            }

            // Step 3: Create request body. It has to be in Dictionary<string, string> format for FormUrlEncodedContent
            var postObj = new Dictionary<string, string>
            {
                { "client_id", vaultCredential.Data["ClientId"].ToString()! },
                { "scope", "https://graph.microsoft.com/.default" },
                { "client_secret", vaultCredential.Data["ClientSecret"].ToString()! },
                { "grant_type", "client_credentials" }
            };

            // Step 4: Send POST request to get token
            var jsonDocument = await HttpClientHelper.PostAsync(
                url: $"https://login.microsoftonline.com/{vaultCredential.Data["AzureTenantId"]}/oauth2/v2.0/token",
                content: postObj,
                mediaType: "application/x-www-form-urlencoded");
            
            // Step 5: Extract access token
            var accessToken = jsonDocument.RootElement.GetProperty("access_token").GetString();
            if (accessToken == null)
            {
                _logger.LogWarning("Failed to obtain M365 access token for Credential ID: {CredentialId}", credentialId);
                return null;
            }

            // Step 6: Return access token
            return accessToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return null;
        }
    }

    public async Task<JsonDocument> GetDriveAndItemIdAsync(string accessToken, string fileUrl)
    {
        // Step 1: Validate required parameters
        if (string.IsNullOrEmpty(fileUrl))
        {
            _logger.LogWarning("Missing or empty 'fileUrl' in payload.");
            return JsonDocument.Parse(@"{""error"": ""Missing or empty fileUrl""}");
        }

        try
        {
            // Step 2: Extract domain and path from FileUrl
            var fileUri = new Uri(fileUrl);
            var domain = fileUri.Host;

            // Split the path to separate site and file path
            var segments = fileUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

            // Find the index of "sites" or "teams" (SharePoint site root)
            int siteRootIdx = Array.FindIndex(segments, s => s.Equals("sites", StringComparison.OrdinalIgnoreCase) || s.Equals("teams", StringComparison.OrdinalIgnoreCase));
            if (siteRootIdx == -1)
            {
                _logger.LogWarning("Invalid SharePoint URL: missing 'sites' or 'teams' segment. URL: {FileUrl}", fileUrl);
                return JsonDocument.Parse(@"{""error"": ""Invalid SharePoint URL: missing 'sites' or 'teams' segment.""}");
            }

            // Site path: from root to site name
            string sitePath = "/" + string.Join('/', segments.Take(siteRootIdx + 2)); // e.g., /sites/AventisiaTechnologiesPvtLtd

            // File path: everything after the site path (skip 'site root', 'site name' and 'Shared Documents' e.g. '/sites/AventisiaTechnologiesPvtLtd/Shared Documents')
            string relativeFilePath = string.Join('/', segments.Skip(siteRootIdx + 3)); // e.g., General/m365_connector_testing.xlsx
            relativeFilePath = Uri.UnescapeDataString(relativeFilePath);

            // Step 3: Get the sharepoint site
            var siteUrl = $"{GRAPH_BASE_URL}/sites/{domain}:{sitePath}";
            var siteJsonDocument = await HttpClientHelper.GetAsync(siteUrl, accessToken);
            var siteId = siteJsonDocument.RootElement.GetProperty("id").GetString();

            // Step 4: Get the default drive associated with the site (use /drive for default document library)
            var driveUrl = $"{GRAPH_BASE_URL}/sites/{siteId}/drive";
            var driveJsonDocument = await HttpClientHelper.GetAsync(driveUrl, accessToken);
            var driveId = driveJsonDocument.RootElement.GetProperty("id").GetString();

            // Step 5: Get the drive item (file) by path
            var itemUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/root:/{relativeFilePath}";
            var itemJsonDocument = await HttpClientHelper.GetAsync(itemUrl, accessToken);
            var itemId = itemJsonDocument.RootElement.GetProperty("id").GetString();

            return JsonDocument.Parse($@"{{""siteId"": ""{siteId}"", ""driveId"": ""{driveId}"", ""itemId"": ""{itemId}"", ""driveAndItemId"": ""{driveId}/items/{itemId}""}}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception in GetDriveAndItemId");
            return JsonDocument.Parse($@"{{""error"": ""Exception: {ex.Message.Replace("\"", "'")}""}}");
        }
    }
}