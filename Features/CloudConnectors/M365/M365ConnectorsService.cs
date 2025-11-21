using System.Net.Http.Headers;
using System.Runtime.InteropServices;
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
                Response = null,
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

            // Step 3: Define new HttpClient with access token
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.Token);

            // Step 4: Take action based on connector unique name
            object? m365Response = null;
            switch (cloudConnectorReqDto.Action)
            {
                case nameof(M365ActionsEnum.GetDriveIdAndItemId):
                    m365Response = await GetDriveAndItemIdAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.AddWorksheet):
                    m365Response = await AddWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.GetWorksheetNames):
                    m365Response = await GetWorksheetNamesAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.WriteValueToRange):
                    m365Response = await WriteValueToRangeAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.ReadValueFromRange):
                    m365Response = await ReadValueFromRangeAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.RenameWorksheet):
                    m365Response = await RenameWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.ReadFormula):
                    m365Response = await ReadFormulaAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.DeleteWorksheet):
                    m365Response = await DeleteWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.ClearWorksheetRange):
                    m365Response = await ClearWorksheetRangeAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.DeleteNamedRange):
                    m365Response = await DeleteNamedRangeAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.GetColumnFromWorksheetByIndex):
                    m365Response = await GetColumnFromWorksheetByIndexAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.SetColorInExcelWorksheet):
                    m365Response = await SetColorInExcelWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.SelectSpecificRangeOfCellInWorksheet):
                    m365Response = await SelectSpecificRangeOfCellInWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.ResizeColumnsRowsInExcelWorksheet):
                    m365Response = await ResizeColumnsRowsInExcelWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.LookupRangeinExcelWorksheet):
                    m365Response = await LookupRangeinExcelWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.GetWorkbookInfo):
                    m365Response = await GetWorkbookInfoAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.CheckIfWorksheetExistsInWorkbook):
                    m365Response = await CheckIfWorksheetExistsInWorkbookAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.AppendRangeToExcelWorksheet):
                    m365Response = await AppendRangeToExcelWorksheetAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.CreateTableInExcel):
                    m365Response = await CreateTableInExcelAsync(httpClient, cloudConnectorReqDto.Payload);
                    break;
                case nameof(M365ActionsEnum.ExportWorkbookToPdf):
                    m365Response = await ExportWorkbookToPdfAsync(httpClient, cloudConnectorReqDto.Payload);
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
            serviceResponse.Data.Response = m365Response;
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

    // Action: Get Drive ID and Item ID from SharePoint url
    private async Task<JsonDocument> GetDriveAndItemIdAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
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
            var siteUrl = $"https://graph.microsoft.com/v1.0/sites/{domain}:{sitePath}";
            var siteResponse = await httpClient.GetAsync(siteUrl);
            if (!siteResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("SharePoint site not found for domain: {Domain}, sitePath: {SitePath}", domain, sitePath);
                return JsonDocument.Parse(@"{""error"": ""SharePoint site not found""}");
            }
            var siteJson = JsonDocument.Parse(await siteResponse.Content.ReadAsStringAsync());
            if (!siteJson.RootElement.TryGetProperty("id", out var siteIdElement))
            {
                _logger.LogWarning("SharePoint site response missing 'id'.");
                return JsonDocument.Parse(@"{""error"": ""SharePoint site response missing 'id'""}");
            }
            var siteId = siteIdElement.GetString();

            // Step 4: Get the default drive associated with the site (use /drive for default document library)
            var driveUrl = $"https://graph.microsoft.com/v1.0/sites/{siteId}/drive";
            var driveResponse = await httpClient.GetAsync(driveUrl);
            if (!driveResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("Default drive not found for site: {SiteId}", siteId);
                return JsonDocument.Parse(@"{""error"": ""Default drive not found for site""}");
            }
            var driveJson = JsonDocument.Parse(await driveResponse.Content.ReadAsStringAsync());
            if (!driveJson.RootElement.TryGetProperty("id", out var driveIdElement))
            {
                _logger.LogWarning("Drive response missing 'id'.");
                return JsonDocument.Parse(@"{""error"": ""Drive response missing 'id'""}");
            }
            var driveId = driveIdElement.GetString();

            // Step 5: Get the drive item (file) by path
            var itemUrl = $"https://graph.microsoft.com/v1.0/drives/{driveId}/root:/{relativeFilePath}";
            var itemResponse = await httpClient.GetAsync(itemUrl);
            if (!itemResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("Drive item not found for path: {RelativeFilePath}", relativeFilePath);
                return JsonDocument.Parse(@"{""error"": ""Drive item not found for given path""}");
            }
            var itemJson = JsonDocument.Parse(await itemResponse.Content.ReadAsStringAsync());
            if (!itemJson.RootElement.TryGetProperty("id", out var itemIdElement))
            {
                _logger.LogWarning("Drive item response missing 'id'.");
                return JsonDocument.Parse(@"{""error"": ""Drive item response missing 'id'""}");
            }
            var itemId = itemIdElement.GetString();

            return JsonDocument.Parse($@"{{""driveId"": ""{driveId}"", ""itemId"": ""{itemId}""}}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception in GetDriveAndItemId");
            return JsonDocument.Parse($@"{{""error"": ""Exception: {ex.Message.Replace("\"", "'")}""}}");
        }
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
    private async Task<JsonDocument?> GetWorksheetNamesAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
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

    // Action: Rename excel worksheet PATCH
    private async Task<JsonDocument?> RenameWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var newWorksheetName = connectorRequestPayload["newWorksheetName"].ToString();

        // Step 2: prepare payload for rename worksheet
        var renamePayload = new
        {
            name = newWorksheetName
        };

        // Step 3: Send PATCH request and return response
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}";

        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(renamePayload), System.Text.Encoding.UTF8, "application/json");
        var response = await httpClient.PatchAsync(url, content);

        // Step 4: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    }

    // Action: Read formula from Excel cell GET
    private async Task<JsonDocument?> ReadFormulaAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // step 1: get the request parameters.
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var cellAddress = connectorRequestPayload["CellAddress"].ToString();

        // step 2: send a get request and fetch formula as per cell address
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{cellAddress}')";
        var response = await httpClient.GetAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    }

    // Action: DeleteWorksheet
    private async Task<JsonDocument?> DeleteWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // step 1: get the request parameters.
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();

        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}";
        var response = await httpClient.DeleteAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse("{}");
    }

    // Action: GetColumnNameOnExcelWorksheet
    private async Task<JsonDocument?> GetColumnFromWorksheetByIndexAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // step 1: get the request parameters.
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var columnIndex = int.Parse(connectorRequestPayload["columnIndex"].ToString());

        var columnLetter = GetColumnLetter(columnIndex);
        // step 2: send a get request and fetch formula as per cell address
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{columnLetter}:{columnLetter}')";

        var response = await httpClient.GetAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    }
    // Helper metho: convert columnindex to letter (A=1,B=2)
    private static string GetColumnLetter(int columnNumber)
    {
        if (columnNumber <= 0)
        {
            throw new ArgumentException("Column number must be positive");
        }
        var letters = "";
        while (columnNumber > 0)
        {
            columnNumber--;
            letters = (char)('A' + columnNumber % 26) + letters;
            columnNumber /= 26;
        }
        return letters;
    }

    // Action: ClearNamedRange
    private async Task<JsonDocument?> ClearWorksheetRangeAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();
        var applyTo = connectorRequestPayload["applyTo"]?.ToString();
        
        applyTo = char.ToUpper(applyTo[0]) + applyTo.Substring(1) ?? "All"; // applyTo: "all", "contents", "formats"

        // Step 2: Prepare request payload
        var payload = new { applyTo = applyTo };
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

        // Step 3: Send POST request and return response
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}'/clear";
        var response = await httpClient.PostAsync(url, content);

        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    //Action: DeleteNamedRange
    private async Task<JsonDocument?> DeleteNamedRangeAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();
        var shiftTo = connectorRequestPayload.GetValueOrDefault("shiftTo", "Up").ToString(); // shiftTo: "up", "Left"
        shiftTo = char.ToUpper(shiftTo[0]) + shiftTo.Substring(1) ?? "Up";
        var payload = new { shiftTo };
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}'/delete";
        var response = await httpClient.PostAsync(url, content);
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    }

    //Action: SetColorInExcelWorksheet
    private async Task<JsonDocument?> SetColorInExcelWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"]?.ToString();
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();
        var colorHex = connectorRequestPayload["colorHex"].ToString();

        // Validate hex format (optional but recommended)
        if (!colorHex.StartsWith("#") || colorHex.Length != 7)
            throw new ArgumentException("Color must be in 6-digit hex format with # prefix (e.g., #FF0000).");

        // Step 2: Prepare request payload
        var payload = new { color = colorHex };

        // Step 3: Send request and return response
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}')/format/fill";
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
        var response = await httpClient.PatchAsync(url, content);

        // Step 4: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    //Action: SelectSpecificRangeOfCellInWorksheet
    private async Task<JsonDocument?> SelectSpecificRangeOfCellInWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"]?.ToString();
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();

        // step 2: send a get request and fetch specific range.
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}')";
        var response = await httpClient.GetAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    //Action: ResizeColumnsRowsInExcelWorksheet
    private async Task<JsonDocument?> ResizeColumnsRowsInExcelWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();

        // Required: rangeAddress like "A:A", "1:1", "B:D"
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();

        var columnWidth = connectorRequestPayload.TryGetValue("columnWidth", out var cwObj)
            ? (double?)Convert.ToDouble(cwObj)
            : null;

        var rowHeight = connectorRequestPayload.TryGetValue("rowHeight", out var rhObj)
            ? (double?)Convert.ToDouble(rhObj)
            : null;

        if (!columnWidth.HasValue && !rowHeight.HasValue)
            throw new ArgumentException("At least one of 'columnWidth' or 'rowHeight' must be provided.");

        // step2: assign value in Payload 
        var payload = new Dictionary<string, object>();
        if(columnWidth.HasValue) payload["columnWidth"] = columnWidth.Value;
        if (rowHeight.HasValue) payload["rowHeight"] = rowHeight.Value;

        // Build URL with range(address='...')
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}')/format";
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync(url, content);
        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    private async Task<JsonDocument?> LookupRangeinExcelWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // step 1: get the request parameters.
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();
        var rangeAddress = connectorRequestPayload["rangeAddress"].ToString();

        // step 2: send a get request and fetch formula as per cell address
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{rangeAddress}')";
        var response = await httpClient.GetAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    }

    // Action: GetWorkbookInfo
    private async Task<JsonDocument?> GetWorkbookInfoAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        // Step 1: Get request parameters
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();

        // Step 2: Build Graph API URL
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}";
        // Step 3: Send GET request
        var response = await httpClient.GetAsync(url);

        // Step 3: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    // Action: CheckIfWorksheetExistsInWorkbook
    private async Task<bool> CheckIfWorksheetExistsInWorkbookAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"].ToString();

        try
        {
            // Step 1: Check if file exists and is an Excel file
            var fileUrl = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}";
            var fileResponse = await httpClient.GetAsync(fileUrl);

            if (!fileResponse.IsSuccessStatusCode)
                return false;

            var fileJson = JsonDocument.Parse(await fileResponse.Content.ReadAsStringAsync());
            var root = fileJson.RootElement;

            // Optional: Verify it's an Excel file
            if (root.TryGetProperty("file", out var fileProp) &&
                fileProp.TryGetProperty("mimeType", out var mimeType))
            {
                var mime = mimeType.GetString();
                if (mime != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    return false;
            }

            // Step 2: validate if worksheet exists
            var encodedWorksheetName = Uri.EscapeDataString(worksheetName);
            var sheetUrl = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{encodedWorksheetName}";

            var sheetResponse = await httpClient.GetAsync(sheetUrl);
            return sheetResponse.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private async Task<byte[]> ExportWorkbookToPdfAsync(HttpClient httpClient,Dictionary<string, object> connectorRequestPayload)
    {
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();

        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/exportPdf";
        var response = await httpClient.PostAsync(url, null);
        response.EnsureSuccessStatusCode();

        // PDF is binary → return byte[]
        return await response.Content.ReadAsByteArrayAsync();
    }

    //Action : Create Table in Excel.
    private async Task<JsonDocument> CreateTableInExcelAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"]?.ToString();
        var address = connectorRequestPayload["address"].ToString(); // e.g., "A1:D10"
        var hasHeaders = connectorRequestPayload.ContainsKey("hasHeaders")
            ? Convert.ToBoolean(connectorRequestPayload["hasHeaders"])
            : true;
        var tableName = connectorRequestPayload["tableName"]?.ToString() ?? "Table1";

        var payload = new
        {
            address = address,
            hasHeaders = hasHeaders,
            name = tableName
        };

        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/tables/add";
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync(url, content);

        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    // Action: AppendRangeToExcelWorksheet
    private async Task<JsonDocument> AppendRangeToExcelWorksheetAsync(HttpClient httpClient, Dictionary<string, object> connectorRequestPayload)
    {
        //Step 1: get the request parameters.
        var driveId = connectorRequestPayload["driveId"].ToString();
        var itemId = connectorRequestPayload["itemId"].ToString();
        var worksheetName = connectorRequestPayload["worksheetName"]?.ToString();
        var startingColumn = connectorRequestPayload["startingColumn"]?.ToString() ?? "A";
        var firstRowHasHeaders = connectorRequestPayload.ContainsKey("firstRowHasHeaders")
            ? Convert.ToBoolean(connectorRequestPayload["firstRowHasHeaders"])
            : true;

        var dataRows = connectorRequestPayload["dataRows"] as IEnumerable<object>;
        if (dataRows == null || !dataRows.Any())
            throw new ArgumentException("dataRows must be provided and non-empty.");

        // Step 2: Get last used row
        int lastRow = 0;
        var usedRangeUrl = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/usedRange";
        var usedRangeResponse = await httpClient.GetAsync(usedRangeUrl);

        if (usedRangeResponse.IsSuccessStatusCode)
        {
            var usedRangeContent = await usedRangeResponse.Content.ReadAsStringAsync();
            using var usedRangeDoc = JsonDocument.Parse(usedRangeContent);
            var address = usedRangeDoc.RootElement.GetProperty("address").GetString();
            lastRow = ParseLastRowFromAddress(address);
        }
        // If 404 (empty sheet), lastRow remains 0 → start at row 1

        // Step 3: Build 2D values array 
        var values = BuildValuesArray(dataRows, firstRowHasHeaders);
        if (values.GetLength(0) == 0)
            return JsonDocument.Parse("{\"message\":\"No data to append.\"}");

        int rowsToAppend = values.GetLength(0);
        int colsToAppend = values.GetLength(1);

        // Step 4: Compute column letters
        int startColIndex = ColumnLetterToIndex(startingColumn);
        string startColLetter = ColumnIndexToLetter(startColIndex);
        string endColLetter = ColumnIndexToLetter(startColIndex + colsToAppend - 1);

        // Step 5: Compute target range
        int startRow = lastRow + 1;
        int endRow = startRow + rowsToAppend - 1;
        string targetRange = $"{startColLetter}{startRow}:{endColLetter}{endRow}";

        // Step 6: Send PATCH request
        var payload = new { values = values };
        var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{targetRange}')";
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
        var response = await httpClient.PatchAsync(url, content);

        // Step 7: Return response as JsonDocument
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    }

    //Helper method : Parse last row from address (e.g., "Sheet1!A1:D15" → 15)
    private static int ParseLastRowFromAddress(string address)
    {
        var parts = address.Split('!');
        var rangePart = parts.Length == 2 ? parts[1] : parts[0];
        var cells = rangePart.Split(':');
        var lastCell = cells.Length == 2 ? cells[1] : cells[0];
        var match = Regex.Match(lastCell, @"\d+$");
        return match.Success ? int.Parse(match.Value) : 1;
    }

    // Helper method : Build 2D object array from rows 
    private static object[,] BuildValuesArray(IEnumerable<object> dataRows, bool skipFirstRow)
    {
        var rowsList = dataRows.ToList();
        int startRowIdx = skipFirstRow ? 1 : 0;
        int rowCount = Math.Max(0, rowsList.Count - startRowIdx);
        if (rowCount <= 0) return new object[0, 0];

        // Determine max column count across all rows
        int colCount = rowsList.Skip(startRowIdx)
            .Select(r => (r as IEnumerable<object>)?.Count() ?? 0)
            .DefaultIfEmpty(0)
            .Max();

        var values = new object[rowCount, colCount];
        for (int i = 0; i < rowCount; i++)
        {
            var sourceRow = rowsList[i + startRowIdx] as IEnumerable<object>;
            var cells = sourceRow?.Cast<object>().ToList() ?? new List<object>();
            for (int j = 0; j < colCount; j++)
            {
                values[i, j] = j < cells.Count ? (cells[j]?.ToString() ?? string.Empty) : string.Empty;
            }
        }
        return values;
    }

    // Helper method : "A" → 1, "AA" → 27 
    private static int ColumnLetterToIndex(string letter)
    {
        if (string.IsNullOrWhiteSpace(letter))
            throw new ArgumentException("Column letter cannot be null or empty.");
        letter = letter.ToUpperInvariant();
        int index = 0;
        foreach (char c in letter)
        {
            if (c < 'A' || c > 'Z')
                throw new ArgumentException($"Invalid character '{c}' in column letter.");
            index = index * 26 + (c - 'A' + 1);
        }
        return index;
    }

    // Helper method : 1 → "A", 27 → "AA" (supports all Excel columns)
    private static string ColumnIndexToLetter(int index)
    {
        if (index < 1)
            throw new ArgumentException("Column index must be >= 1.");
        var result = "";
        while (index > 0)
        {
            index--;
            result = (char)('A' + (index % 26)) + result;
            index /= 26;
        }
        return result;
    }

}
