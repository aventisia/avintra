namespace WorkspaceAPIs.Features.CloudConnectors.M365;

public class M365ConnectorsService : IM365ConnectorsService
{
    private static readonly string[] M365CredentialFields = ["AzureTenantId", "ClientId", "ClientSecret"];

    private readonly ILogger<M365ConnectorsService> _logger;
    private readonly ICloudConnectorsVaultCredentialService _cloudConnectorsVaultCredentialService;
    public string GRAPH_BASE_URL => "https://graph.microsoft.com/v1.0";

    public M365ConnectorsService(
        ILogger<M365ConnectorsService> logger,
        ICloudConnectorsVaultCredentialService cloudConnectorsVaultCredentialService)
    {
        _logger = logger;
        _cloudConnectorsVaultCredentialService = cloudConnectorsVaultCredentialService;
    }

    public async Task<string?> GetM365AccessTokenAsync(string credentialName)
    {
        var (accessToken, _) = await TryGetM365AccessTokenAsync(credentialName);
        return accessToken;
    }

    public async Task<(string? AccessToken, string? Failure)> TryGetM365AccessTokenAsync(string credentialName)
    {
        string? clientSecret = null;
        try
        {
            // Step 1: Get credentials from vault
            var resolution = await _cloudConnectorsVaultCredentialService.ResolveVaultCredentialAsync(credentialName);
            if (!resolution.IsSuccess)
            {
                _logger.LogWarning("No usable M365 credential with Name: {CredentialName}", CloudConnectorLogRedactor.SanitizeForLog(credentialName));
                return (null, resolution.FailureMessage);
            }

            // Step 2: Validate required credential fields
            var credentialData = resolution.Credential!.Data;
            var credentialValues = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var field in M365CredentialFields)
            {
                var fieldValue = GetCredentialValue(credentialData, field);
                if (string.IsNullOrWhiteSpace(fieldValue))
                {
                    _logger.LogWarning("No '{Field}' value in M365 credential {CredentialName}.", field, CloudConnectorLogRedactor.SanitizeForLog(credentialName));
                    return (null, CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, field));
                }
                credentialValues[field] = fieldValue;
            }
            clientSecret = credentialValues["ClientSecret"];

            // Step 3: Create request body. It has to be in Dictionary<string, string> format for FormUrlEncodedContent
            var postObj = new Dictionary<string, string>
            {
                { "client_id", credentialValues["ClientId"] },
                { "scope", "https://graph.microsoft.com/.default" },
                { "client_secret", clientSecret },
                { "grant_type", "client_credentials" }
            };

            // Step 4: Send POST request to get token
            var jsonDocument = await HttpClientHelper.PostAsync(
                url: $"https://login.microsoftonline.com/{credentialValues["AzureTenantId"]}/oauth2/v2.0/token",
                content: postObj,
                mediaType: "application/x-www-form-urlencoded");

            if (jsonDocument == null)
            {
                return (null, CredentialResolution.ToLogMessage(CredentialResolutionReason.Unavailable, credentialName));
            }

            // Step 5: A rejected client secret comes back as 401/403 with the AAD error text
            var tokenResponse = jsonDocument.RootElement;
            if (tokenResponse.TryGetProperty("statusCode", out var statusElement) &&
                statusElement.TryGetInt32(out var statusCode) &&
                statusCode is 401 or 403)
            {
                _logger.LogWarning("The token endpoint rejected M365 credential {CredentialName} with status {Status}.", CloudConnectorLogRedactor.SanitizeForLog(credentialName), statusCode);
                var reason = tokenResponse.TryGetProperty("error", out var errorElement)
                    ? errorElement.ValueKind == JsonValueKind.String ? errorElement.GetString() : errorElement.ToString()
                    : null;
                return (null, CredentialResolution.ToLogMessage(
                    CredentialResolutionReason.RejectedUpstream,
                    credentialName,
                    CloudConnectorLogRedactor.RedactProviderReason(reason, clientSecret)));
            }

            // Step 6: Extract access token
            var accessToken = tokenResponse.TryGetProperty("access_token", out var tokenElement) ? tokenElement.GetString() : null;
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogWarning("Failed to obtain M365 access token for Credential Name: {CredentialName}", credentialName);
                return (null, CredentialResolution.ToLogMessage(CredentialResolutionReason.Unavailable, credentialName));
            }

            return (accessToken, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return (null, CredentialResolution.ToLogMessage(CredentialResolutionReason.Unavailable, credentialName));
        }
    }

    private static string? GetCredentialValue(Dictionary<string, object>? data, string key)
    {
        if (data is null)
        {
            return null;
        }

        foreach (var entry in data)
        {
            if (string.Equals(entry.Key, key, StringComparison.OrdinalIgnoreCase))
            {
                return entry.Value switch
                {
                    null => null,
                    string text => text,
                    JsonElement element => element.ValueKind == JsonValueKind.String ? element.GetString() : element.ToString(),
                    _ => Convert.ToString(entry.Value)
                };
            }
        }

        return null;
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
            var (accessToken, credentialFailure) = await TryGetM365AccessTokenAsync(cloudConnectorReqDto.CredentialName);
            if (accessToken == null)
            {
                _logger.LogWarning("Failed to obtain M365 access token for Credential Name: {CredentialName}", cloudConnectorReqDto.CredentialName);
                serviceResponse.Message = credentialFailure;
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