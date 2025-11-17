using System.Net.Http.Headers;
using Azure.Identity;
using Microsoft.Graph;

namespace WorkspaceAPIs.Features.CloudConnectors.M365;

public class M365ConnectorsService : IM365ConnectorsService
{
    private readonly ILogger<M365ConnectorsService> _logger;
    private readonly ICloudConnectorsService _cloudConnectorsService;

    public M365ConnectorsService(
        ILogger<M365ConnectorsService> logger,
        ICloudConnectorsService cloudConnectorsService)
    {
        _logger = logger;
        _cloudConnectorsService = cloudConnectorsService;
    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto()
            {
                Payload = null,
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };

        try
        {
            // Step 1: Get credentials from vault
            var vaultCredential = await _cloudConnectorsService.GetCredentialFromVaultAsync(cloudConnectorReqDto.CredentialId);
            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with ID: {CredentialId} for M365", cloudConnectorReqDto.CredentialId);
                serviceResponse.Message = "M365 Credentials not found.";
                return serviceResponse;
            }

            // Step 2: Get access token using ClientSecretCredential
            var clientSecretCredential = new ClientSecretCredential(
                vaultCredential.Data["AzureTenantId"].ToString(),
                vaultCredential.Data["ClientId"].ToString(),
                vaultCredential.Data["ClientSecret"].ToString());
            var accessToken = await clientSecretCredential.GetTokenAsync(
                new Azure.Core.TokenRequestContext(new[] { "https://graph.microsoft.com/.default" }));

            // Step 3: Define new Graph client and HttpClient with access token. TODO: We can use httpClient to get 
            var graphClient = new GraphServiceClient(clientSecretCredential);
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.Token);

            // Step 4: Take action based on connector unique name
            object? m365Response = null;
            switch (cloudConnectorReqDto.Action)
            {
                case "GetDriveIdAndItemId":
                    m365Response = await GetDriveAndItemId(graphClient, cloudConnectorReqDto.Payload);
                    break;
                case "AddWorksheet":
                    m365Response = await AddWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case "GetWorksheets":
                    m365Response = await GetWorksheetsAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case "WriteValueToRange":
                    m365Response = await WriteValueToRangeAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case "ReadValueFromRange":
                    m365Response = await ReadValueFromRangeAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                default:
                    _logger.LogWarning("Unsupported M365 Connector: {Action}", cloudConnectorReqDto.Action);
                    serviceResponse.Message = "Unsupported M365 Connector.";
                    return serviceResponse;
            }

            // Step 5: m365Response is null
            if (m365Response == null)
            {
                _logger.LogWarning("M365 Connector action returned null response for Connector: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = "M365 Connector action failed.";
                return serviceResponse;
            }

            // Step 6: Request invoked successfully
            serviceResponse.Data.Payload = m365Response;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "M365 Cloud Connector invoked successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Action: Add worksheet
    private async Task<JsonDocument?> AddWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"]?.ToString();

        // Step 2: Prepare request payload
        var newWorksheet = new { name = worksheetName };

        // Step 3: Send request and return response
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets";
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(newWorksheet), System.Text.Encoding.UTF8, "application/json");
        var response = await httpClient.PostAsync(url, content);

        // Step 4: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    // Action: Get worksheets
    private async Task<JsonDocument?> GetWorksheetsAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        // Step 2: Send request and return response
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets";
        var response = await httpClient.GetAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    // Action: Write value to range
    private async Task<JsonDocument?> WriteValueToRangeAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();
        var values = connectorRequestPayload["values"] as JsonElement?;
        // Step 2: Prepare request payload
        var valuePayload = new { values };

        // Step 3: Send PATCH request and return response
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}')";
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(valuePayload), System.Text.Encoding.UTF8, "application/json");
        var response = await httpClient.PatchAsync(url, content);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    // Action: Read value from range
    private async Task<JsonDocument?> ReadValueFromRangeAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();

        // Step 2: Send request and return response
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}')";
        var response = await httpClient.GetAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    // Helper: Get Drive ID and Item ID from SharePoint Site URL and File Path
    private async Task<JsonDocument> GetDriveAndItemId(GraphServiceClient graphClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Validate required parameters
        if (!connectorRequestPayload.ContainsKey("fileUrl") ||
            connectorRequestPayload["fileUrl"] == null ||
            string.IsNullOrEmpty(connectorRequestPayload["fileUrl"].ToString()))
        {
            _logger.LogWarning("Missing or empty 'fileUrl' in connectorRequestPayload.");
            return JsonDocument.Parse(@"{""error"": ""Missing or empty fileUrl""}");
        }

        try
        {
            // Step 2: Extract domain and path from FileUrl
            var fileUri = new Uri(connectorRequestPayload["fileUrl"].ToString()!);
            var domain = fileUri.Host;

            // Step 2.1: Split the path to separate site and file path
            var segments = fileUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

            // Step 2.2: Find the index of "sites" or "teams" (SharePoint site root)
            int siteRootIdx = Array.FindIndex(segments, s => s.Equals("sites", StringComparison.OrdinalIgnoreCase) || s.Equals("teams", StringComparison.OrdinalIgnoreCase));
            if (siteRootIdx == -1)
            {
                _logger.LogWarning("Invalid SharePoint URL: missing 'sites' or 'teams' segment. URL: {FileUrl}", connectorRequestPayload["fileUrl"]);
                return JsonDocument.Parse(@"{""error"": ""Invalid SharePoint URL: missing 'sites' or 'teams' segment.""}");
            }

            // Step 2.3: Site path: from root to site name
            string sitePath = "/" + string.Join('/', segments.Take(siteRootIdx + 2)); // e.g., /sites/AventisiaTechnologiesPvtLtd

            // Step 2.4: File path: everything after the site path (skip 'site root', 'site name' and 'Shared Documents' e.g. '/sites/AventisiaTechnologiesPvtLtd/Shared Documents')
            string relativeFilePath = string.Join('/', segments.Skip(siteRootIdx + 3)); // e.g., General/m365_connector_testing.xlsx
            relativeFilePath = Uri.UnescapeDataString(relativeFilePath);

            // Step 3: Get the sharepoint site
            var site = await graphClient.Sites[$"{domain}:{sitePath}"].GetAsync();
            if (site == null)
            {
                _logger.LogWarning("SharePoint site not found for domain: {Domain}, sitePath: {SitePath}", domain, sitePath);
                return JsonDocument.Parse(@"{""error"": ""SharePoint site not found""}");
            }

            // Step 4: Get the default drive associated with the site (use /drive for default document library)
            var drive = await graphClient.Sites[site.Id].Drive.GetAsync();
            if (drive == null)
            {
                _logger.LogWarning("Default drive not found for site: {SiteId}", site.Id);
                return JsonDocument.Parse(@"{""error"": ""Default drive not found for site""}");
            }

            // Step 5: Get the drive item (file) by path
            var item = await graphClient.Drives[drive.Id].Root.ItemWithPath(relativeFilePath).GetAsync();
            if (item == null)
            {
                _logger.LogWarning("Drive item not found for path: {RelativeFilePath}", relativeFilePath);
                return JsonDocument.Parse(@"{""error"": ""Drive item not found for given path""}");
            }

            return JsonDocument.Parse($@"{{""DriveId"": ""{drive.Id}"", ""ItemId"": ""{item.Id}""}}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception in GetDriveAndItemId");
            return JsonDocument.Parse($@"{{""error"": ""Exception: {ex.Message.Replace("\"", "'")}""}}");
        }
    }
}