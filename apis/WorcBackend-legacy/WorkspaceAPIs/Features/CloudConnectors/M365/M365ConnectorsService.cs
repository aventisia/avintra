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

    public async Task<string?> GetM365AccessTokenAsync(string credentialName)
    {
        try
        {
            // Step 1: Get credentials from vault
            var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialName);
            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with Name: {CredentialName} for M365", credentialName);
                return null;
            }

            // Step 2: Validate required credential fields
            if (vaultCredential.Data["AzureTenantId"] == null ||
                vaultCredential.Data["ClientId"] == null ||
                vaultCredential.Data["ClientSecret"] == null)
            {
                _logger.LogWarning("One or more required credential fields are missing for Credential Name: {CredentialName}", credentialName);
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
                _logger.LogWarning("Failed to obtain M365 access token for Credential Name: {CredentialName}", credentialName);
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
                return JsonDocument.Parse(@"{""statusCode"": 400, ""error"": ""Invalid SharePoint URL: missing 'sites' or 'teams' segment.""}");
            }

            // Site path: from root to site name
            string sitePath = "/" + string.Join('/', segments.Take(siteRootIdx + 2)); // e.g., /sites/YourCompanyName

            // File path: everything after the site path (skip 'site root', 'site name' and 'Shared Documents' e.g. '/sites/YourCompanyName/Shared Documents')
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
            return JsonDocument.Parse($@"{{""statusCode"": 500, ""error"": ""Exception: {ex.Message.Replace("\"", "'")}""}}");
        }
    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto()
            {
                Response = null,
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };

        try
        {
            // Step 1: Get access token from M365ConnectorsService
            var accessToken = await GetM365AccessTokenAsync(cloudConnectorReqDto.CredentialName);
            if (accessToken == null)
            {
                _logger.LogWarning("Failed to obtain M365 access token for Credential Name: {CredentialName}", cloudConnectorReqDto.CredentialName);
                serviceResponse.Message = "Failed to obtain M365 access token.";
                return serviceResponse;
            }

            // Step 2: Take action based on M365 Excel connector unique name
            var m365ExcelResponse = await TakeM365ActionAsync(cloudConnectorReqDto.Action, accessToken, cloudConnectorReqDto.Payload);
            if (m365ExcelResponse == null)
            {
                _logger.LogWarning("M365 Excel connector action returned null response for connector: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = "M365 Excel connector action failed.";
                return serviceResponse;
            }

            // Step 3: Request invoked successfully
            serviceResponse.Data.Response = m365ExcelResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "M365 Excel connector invoked successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Take action based on connector unique name
    private async Task<JsonDocument?> TakeM365ActionAsync(string action, string accessToken, Dictionary<string, object> payload)
    {
        switch (action)
        {
            case nameof(M365ActionsEnum.GetFileDriveAndItemId):
                return await GetDriveAndItemIdAsync(accessToken, payload["fileUrl"].ToString()!);
            default:
                _logger.LogWarning("Unsupported M365 connector: {Action}", action);
                return null;
        }
    }

}