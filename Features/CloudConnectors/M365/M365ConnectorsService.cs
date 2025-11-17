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
                ConnectorResponsePayload = null,
                ConnectorProvider = cloudConnectorReqDto.ConnectorProvider,
                ConnectorUniqueName = cloudConnectorReqDto.ConnectorUniqueName
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

            // Step 3: Define new Graph client and HttpClient with access token
            var graphClient = new GraphServiceClient(clientSecretCredential);
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.Token);

            // Step 4: Take action based on connector unique name
            object? m365Response = null;
            switch (cloudConnectorReqDto.ConnectorUniqueName)
            {
                case "GetDriveIdAndItemId":
                    m365Response = await GetDriveAndItemId(graphClient, cloudConnectorReqDto.ConnectorRequestPayload);
                    break;
                case "AddWorksheet":
                    m365Response = await AddWorksheetAsync(httpClient, cloudConnectorReqDto.ConnectorRequestPayload);
                    break;
                case "GetWorksheets":
                    m365Response = await GetWorksheetsAsync(httpClient, cloudConnectorReqDto.ConnectorRequestPayload);
                    break;
                case "WriteValueToRange":
                    m365Response = await WriteValueToRangeAsync(httpClient, cloudConnectorReqDto.ConnectorRequestPayload);
                    break;
                case "ReadValueFromRange":
                    m365Response = await ReadValueFromRangeAsync(httpClient, cloudConnectorReqDto.ConnectorRequestPayload);
                    break;
                default:
                    _logger.LogWarning("Unsupported M365 Connector: {ConnectorUniqueName}", cloudConnectorReqDto.ConnectorUniqueName);
                    serviceResponse.Message = "Unsupported M365 Connector.";
                    return serviceResponse;
            }

            // Step 5: m365Response is null
            if (m365Response == null)
            {
                _logger.LogWarning("M365 Connector action returned null response for Connector: {ConnectorUniqueName}", cloudConnectorReqDto.ConnectorUniqueName);
                serviceResponse.Message = "M365 Connector action failed.";
                return serviceResponse;
            }

            // Step 6: Request invoked successfully
            serviceResponse.Data.ConnectorResponsePayload = m365Response;
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
        var driveId = connectorRequestPayload["DriveId"].ToString();
        var itemId = connectorRequestPayload["ItemId"].ToString();
        var worksheetName = connectorRequestPayload["WorksheetName"]?.ToString();

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
        var driveId = connectorRequestPayload["DriveId"].ToString();
        var itemId = connectorRequestPayload["ItemId"].ToString();

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
        var driveId = connectorRequestPayload["DriveId"].ToString();
        var itemId = connectorRequestPayload["ItemId"].ToString();
        var worksheetName = connectorRequestPayload["WorksheetName"].ToString();
        var rangeAddress = connectorRequestPayload["RangeAddress"].ToString();
        var values = connectorRequestPayload["Values"] as JsonElement?;

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
        var driveId = connectorRequestPayload["DriveId"].ToString();
        var itemId = connectorRequestPayload["ItemId"].ToString();
        var worksheetName = connectorRequestPayload["WorksheetName"].ToString();
        var rangeAddress = connectorRequestPayload["RangeAddress"].ToString();

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
        if (connectorRequestPayload.ContainsKey("fileUrl") == false ||
            connectorRequestPayload["fileUrl"] == null ||
            string.IsNullOrEmpty(connectorRequestPayload["fileUrl"].ToString()))
        {
            return JsonDocument.Parse("{}");
        }

        // Step 2: Extract domain and path from FileUrl
        var fileUri = new Uri(connectorRequestPayload["fileUrl"].ToString()!);
        var domain = fileUri.Host;

        // Split the path to separate site and file path
        var segments = fileUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

        // Find the index of "sites" or "teams" (SharePoint site root)
        int siteRootIdx = Array.FindIndex(segments, s => s.Equals("sites", StringComparison.OrdinalIgnoreCase) || s.Equals("teams", StringComparison.OrdinalIgnoreCase));
        if (siteRootIdx == -1)
        {
            _logger.LogWarning("Invalid SharePoint URL: missing 'sites' or 'teams' segment.");
            return JsonDocument.Parse("{}");
        }

        // Site path: from root to site name
        string sitePath = "/" + string.Join('/', segments.Take(siteRootIdx + 2)); // e.g., /sites/AventisiaTechnologiesPvtLtd

        // File path: everything after the site path
        string filePath = string.Join('/', segments.Skip(siteRootIdx + 2)); // e.g., Shared Documents/General/m365_connector_testing.xlsx
        filePath = Uri.UnescapeDataString(filePath);

        // Step 3: Get the sharepoint site
        var site = await graphClient.Sites[$"{domain}:{sitePath}"].GetAsync();

        // Step 4: Get the drive associated with the site
        var drives = await graphClient.Sites[site.Id].Drives.GetAsync();
        var documentsDrive = drives.Value != null ? drives.Value.FirstOrDefault(d => d.Name == "Documents") : null;

        // Remove the first segment ("Shared Documents" or "Documents") from the file path
        var filePathSegments = filePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var relativeFilePath = string.Join('/', filePathSegments.Skip(1)); // skip the library name

        // Step 5: Get the drive item (file) by path
        var item = await graphClient.Drives[documentsDrive.Id].Root.ItemWithPath(relativeFilePath).GetAsync();

        return JsonDocument.Parse($@"{{ ""DriveId"": ""{documentsDrive.Id}"", ""ItemId"": ""{item.Id}"" }}");
    }
}