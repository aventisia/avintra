namespace WorkspaceAPIs.Features.CloudConnectors.M365.SharePoint;

public class M365SharePointConnectorsService : IM365SharePointConnectorsService
{
    private readonly ILogger<M365SharePointConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;
    public readonly string GRAPH_BASE_URL;

    public M365SharePointConnectorsService(
        ILogger<M365SharePointConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
        GRAPH_BASE_URL = _m365ConnectorsService.GRAPH_BASE_URL;
    }

    /// <summary>
    /// Entry point for invoking M365 SharePoint cloud connector actions
    /// </summary>
    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        // Validate input request
        if (cloudConnectorReqDto == null)
        {
            _logger.LogWarning("InvokeCloudConnectorAsync called with null request.");
            throw new ArgumentNullException(nameof(cloudConnectorReqDto));
        }

        // Initialize response Default StatusCode = 400 (Bad Request)
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };

        try
        {
            // Validate the action against enum
            if (!Enum.TryParse<M365SharePointActionsEnum>(cloudConnectorReqDto.Action, true, out var parsedAction))
            {
                _logger.LogWarning("Invalid SharePoint action requested: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = "Invalid SharePoint action.";
                return serviceResponse;
            }

            // Retrieve M365 access token
            var accessToken = await _m365ConnectorsService.GetM365AccessTokenAsync(cloudConnectorReqDto.CredentialId);
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogWarning("Failed to retrieve M365 access token for CredentialId: {CredentialId}", cloudConnectorReqDto.CredentialId);
                serviceResponse.Message = "Failed to obtain M365 access token.";
                return serviceResponse;
            }

            // Prepare payload and Ensure payload dictionary is non-null
            var payload = cloudConnectorReqDto.Payload ?? new Dictionary<string, object>();

            // Execute the requested SharePoint action
            var result = await TakeM365SharePointActionAsync(cloudConnectorReqDto.Action, accessToken, payload);

            //Handle failed action execution
            if (result == null)
            {
                _logger.LogWarning("Action execution failed: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = "M365 SharePoint connector action failed.";
                return serviceResponse;
            }

            // Set successful response
            serviceResponse.Data.Response = result;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "M365 SharePoint connector invoked successfully.";
        }
        catch (Exception ex)
        {
            // Handle unexpected errors
            _logger.LogError(ex, "Unhandled exception while invoking SharePoint connector.");
            serviceResponse.Message = "Unexpected error occurred.";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Core SharePoint Action Dispatcher
    /// Maps actions to Microsoft Graph endpoints or logs unsupported actions
    /// </summary>
    private async Task<JsonDocument?> TakeM365SharePointActionAsync(
        string action,
        string accessToken,
        Dictionary<string, object> payload)
    {
        // Helper function to safely retrieve payload values
        string GetValue(string key) => payload.ContainsKey(key) ? payload[key]?.ToString()?.Trim() ?? string.Empty : string.Empty;

        switch (action)
        {
            #region SITE ACTIONS
            case nameof(M365SharePointActionsEnum.GetSites):
                {
                    // Fetch a list of all SharePoint sites
                    return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/sites", accessToken);
                }

            case nameof(M365SharePointActionsEnum.SearchSites):
                {
                    var searchQuery = CloudConnectionPayloadUtil.GetValue(payload, "searchQuery");

                    // Fetch the list of SharePoint sites
                    return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/sites?search={Uri.EscapeDataString(searchQuery)}", accessToken);
                }

            case nameof(M365SharePointActionsEnum.GetSiteById):
                {
                    var siteId = CloudConnectionPayloadUtil.GetValue(payload, "siteId");
                    // Retrieve a specific SharePoint site by its unique ID
                    return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/sites/{siteId}", accessToken);
                }

            case nameof(M365SharePointActionsEnum.GetSiteByPath):
                {
                    // Get the full site URL from the payload
                    var sitePath = CloudConnectionPayloadUtil.GetValue(payload, "sitePath");

                    var uri = new Uri(sitePath);

                    // Hostname (e.g., aventisia.sharepoint.com)
                    var hostname = uri.Host;

                    // Site-relative path (e.g., /sites/AventisiasProducts)
                    var siteRelativePath = uri.AbsolutePath.TrimEnd('/');

                    // Call the API
                    return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/sites/{hostname}:{siteRelativePath}", accessToken);
                }

            case nameof(M365SharePointActionsEnum.CreateSite):
                {
                    // Create a new SharePoint site with the specified parameters (name, description, template, and visibility)
                    var siteCreationPayload = new
                    {
                        displayName = CloudConnectionPayloadUtil.GetValue(payload, "siteDisplayName"),
                        description = CloudConnectionPayloadUtil.GetValue(payload, "siteDescription"),
                        webTemplate = CloudConnectionPayloadUtil.GetValue(payload, "siteTemplate"),
                        isPublic = CloudConnectionPayloadUtil.GetValue(payload, "isPublic")
                    };
                    return await HttpClientHelper.PostAsync($"{GRAPH_BASE_URL}/sites", siteCreationPayload, accessToken);
                }

            case nameof(M365SharePointActionsEnum.UpdateSiteProperties):
                {
                    var siteId = CloudConnectionPayloadUtil.GetValue(payload, "SiteId");
                    // Update an existing SharePoint site's properties such as its display name or description
                    var siteUpdatePayload = new
                    {
                        displayName = CloudConnectionPayloadUtil.GetValue(payload, "updatedSiteDisplayName"),
                        description = CloudConnectionPayloadUtil.GetValue(payload, "updatedSiteDescription")
                    };
                    return await HttpClientHelper.PatchAsync($"{GRAPH_BASE_URL}/sites/{siteId}", siteUpdatePayload, accessToken);
                }
            case nameof(M365SharePointActionsEnum.DeleteSite):
                {
                    var siteId = CloudConnectionPayloadUtil.GetValue(payload, "siteId");
                    // Delete a SharePoint site by its unique ID
                    return await HttpClientHelper.DeleteAsync($"{GRAPH_BASE_URL}/sites/{siteId}", accessToken);
                }
            #endregion

            #region SHAREPOINT FILE MANAGEMENT (Microsoft Graph)

            case nameof(M365SharePointActionsEnum.GetFileByPath):
                {
                    // Full SharePoint file path (example: https://tenant.sharepoint.com/sites/SiteName/Shared%20Documents/folder/file.docx)
                    var filePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");

                    // Resolve the document library (drive) identifier from the path
                    var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);

                    // Resolve the file item identifier inside the drive
                    var itemId = await GetItemIdFromFilePathAsync(filePath, accessToken);

                    // Build Microsoft Graph request URL to retrieve file metadata
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}";

                    // Execute GET request and return file information
                    return await HttpClientHelper.GetAsync(requestUrl, accessToken);
                }

            case nameof(M365SharePointActionsEnum.GetDriveFiles):
                {
                    // Read full SharePoint drive path (document library or subfolder)
                    var drivePath = CloudConnectionPayloadUtil.GetValue(payload, "drivePath");

                    var driveUri = new Uri(drivePath);

                    // Extract path relative to document library root
                    var relativePath = GetRelativeFilePath(driveUri)?.Trim('/');

                    // Resolve document library (Drive) ID
                    var driveId = await GetDriveIdFromFilePathAsync(drivePath, accessToken);

                    // Build Microsoft Graph endpoint
                    var requestUrl = string.IsNullOrWhiteSpace(relativePath)
                        ? $"{GRAPH_BASE_URL}/drives/{driveId}/root/children"
                        : $"{GRAPH_BASE_URL}/drives/{driveId}/root:/{relativePath}:/children";

                    // Execute request and return folder contents
                    return await HttpClientHelper.GetAsync(requestUrl, accessToken);
                }

            case nameof(M365SharePointActionsEnum.FileUpload):
                {
                    // Read input values from the payload
                    var drivePath = CloudConnectionPayloadUtil.GetValue(payload, "FilePath");
                    var fileName = CloudConnectionPayloadUtil.GetValue(payload, "FileName");
                    var contentSource = CloudConnectionPayloadUtil.GetValue(payload, "ContentSource");
                    var content = CloudConnectionPayloadUtil.GetValue(payload, "Content");

                    // Variable to store the final file bytes that will be uploaded
                    byte[] fileBytes;

                    if (contentSource?.ToLower() == "url")
                    {
                        // If the content source is a URL, download the file from the provided URL and retrieve the file content as a byte array
                        fileBytes = await GetFileBytesFromUrlAsync(content);
                    }
                    else
                    {
                        // If the content source is Base64, process the encoded string
                        // Remove the data URL prefix if present (e.g., "data:application/pdf;base64,")
                        if (content.Contains(","))
                            content = content.Split(',')[1];

                        // Convert the Base64-encoded string into a byte array for file upload
                        fileBytes = Convert.FromBase64String(content);
                    }

                    // Parse the drive path to extract necessary components
                    var driveUri = new Uri(drivePath);

                    // Extract folder path relative to document library root
                    var relativePath = GetRelativeFilePath(driveUri)?.Trim('/');

                    // Resolve document library (Drive) ID
                    var driveId = await GetDriveIdFromFilePathAsync(drivePath, accessToken);

                    // Build Microsoft Graph upload endpoint
                    var uploadUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/root:/{(string.IsNullOrWhiteSpace(relativePath) ? "" : relativePath + "/")}{fileName}:/content";

                    // Upload file content (creates or replaces existing file)
                    return await UploadFileToSharePointAsync(uploadUrl, fileBytes, accessToken);
                }

            case nameof(M365SharePointActionsEnum.UpdateFile):
                {
                    // Read inputs from payload
                    var filePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");
                    var newFileName = CloudConnectionPayloadUtil.GetValue(payload, "fileName");

                    // Resolve the document library (Drive) ID from path
                    var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);

                    // Resolve the file's item ID within the drive
                    var itemId = await GetItemIdFromFilePathAsync(filePath, accessToken);

                    // Build Microsoft Graph endpoint URL
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}";

                    // Prepare request body to rename file
                    var updateBody = new
                    {
                        name = newFileName
                    };

                    // Execute PATCH request to update file metadata
                    return await HttpClientHelper.PatchAsync(requestUrl, updateBody, accessToken);
                }

            case nameof(M365SharePointActionsEnum.DeleteFile):
                {
                    // Full SharePoint file path (document library path + file)
                    var filePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");

                    // Resolve document library (Drive) ID from path
                    var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);

                    // Resolve the file's item ID within the drive
                    var itemId = await GetItemIdFromFilePathAsync(filePath, accessToken);

                    // Build Microsoft Graph endpoint URL for deletion.
                    // The item is deleted via /items/{itemId} (the '/content' suffix is not valid for deletion).
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}";

                    // Execute DELETE request
                    return await HttpClientHelper.DeleteAsync(requestUrl, accessToken);
                }

            case nameof(M365SharePointActionsEnum.DownloadFile):
                {
                    var filePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");

                    var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);
                    var itemId = await GetItemIdFromFilePathAsync(filePath, accessToken);

                    var result = await DownloadFileWithMetadataAsync(driveId, itemId, accessToken);

                    return result;
                }

            case nameof(M365SharePointActionsEnum.CopyFile):
                {
                    // Read inputs from payload
                    var sourceDrivePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");
                    var destinationDrivePath = CloudConnectionPayloadUtil.GetValue(payload, "drivePath");
                    var newFileName = CloudConnectionPayloadUtil.GetValue(payload, "fileName");

                    // Resolve source document library (Drive) and file item
                    var sourceDriveId = await GetDriveIdFromFilePathAsync(sourceDrivePath, accessToken);
                    var sourceItemId = await GetItemIdFromFilePathAsync(sourceDrivePath, accessToken);

                    // Resolve destination document library (Drive) and folder item
                    var destinationDriveId = await GetDriveIdFromFilePathAsync(destinationDrivePath, accessToken);
                    var destinationFolderItemId = await GetItemIdFromFilePathAsync(destinationDrivePath, accessToken);

                    // Build Microsoft Graph copy endpoint
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{sourceDriveId}/items/{sourceItemId}/copy" +
                        "?@microsoft.graph.conflictBehavior=rename";

                    // Prepare request body. 'name' is optional in the Graph API and must be
                    // omitted (not sent as empty string) when no new file name is provided,
                    // otherwise the destination keeps the original file name.
                    var copyBody = new Dictionary<string, object>
                    {
                        ["parentReference"] = new Dictionary<string, object>
                        {
                            ["driveId"] = destinationDriveId,
                            ["id"] = destinationFolderItemId
                        }
                    };

                    if (!string.IsNullOrWhiteSpace(newFileName))
                        copyBody["name"] = newFileName;

                    // Execute copy request
                    return await HttpClientHelper.PostAsync(requestUrl, copyBody, accessToken);
                }

            case nameof(M365SharePointActionsEnum.MoveFile):
                {
                    // Read inputs from payload
                    var sourceDrivePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");
                    var destinationDrivePath = CloudConnectionPayloadUtil.GetValue(payload, "drivePath");

                    // Resolve source document library (Drive) and file item
                    var sourceDriveId = await GetDriveIdFromFilePathAsync(sourceDrivePath, accessToken);
                    var sourceItemId = await GetItemIdFromFilePathAsync(sourceDrivePath, accessToken);

                    // Resolve destination document library (Drive) and folder item
                    var destinationDriveId = await GetDriveIdFromFilePathAsync(destinationDrivePath, accessToken);
                    var destinationFolderItemId = await GetItemIdFromFilePathAsync(destinationDrivePath, accessToken);

                    // Build Microsoft Graph endpoint for moving the file
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{sourceDriveId}/items/{sourceItemId}";

                    // Prepare request body to change parent folder
                    var moveBody = new
                    {
                        parentReference = new
                        {
                            driveId = destinationDriveId,
                            id = destinationFolderItemId
                        }
                    };

                    // Execute PATCH request to move the file
                    return await HttpClientHelper.PatchAsync(requestUrl, moveBody, accessToken);
                }

            case nameof(M365SharePointActionsEnum.CheckOutFile):
                {
                    // Read full SharePoint file path
                    var filePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");

                    // Resolve document library (Drive) and file item ID
                    var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);
                    var itemId = await GetItemIdFromFilePathAsync(filePath, accessToken);

                    // Build Graph endpoint URL for checkout
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}/checkout";

                    // Execute POST request to check out the file
                    return await HttpClientHelper.PostAsync(requestUrl, null, accessToken);
                }

            case nameof(M365SharePointActionsEnum.CheckInFile):
                {
                    // Read inputs from payload
                    var filePath = CloudConnectionPayloadUtil.GetValue(payload, "FilePath");
                    var comment = CloudConnectionPayloadUtil.GetValue(payload, "Comment") ?? "Checked in";
                    var checkInType = CloudConnectionPayloadUtil.GetValue(payload, "CheckInType") ?? "Simple";

                    // Resolve document library (Drive) and file item ID
                    var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);
                    var itemId = await GetItemIdFromFilePathAsync(filePath, accessToken);

                    // Build Graph endpoint URL for checkin
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}/checkin";

                    // Prepare request body. Graph's 'checkInAs' only accepts "published"
                    // (or unspecified). The config offers Minor/Major/Simple, which we map:
                    //   - Major  -> checkInAs = published (creates a major version)
                    //   - Minor/Simple -> omit checkInAs
                    var requestBody = new Dictionary<string, object>
                    {
                        ["comment"] = comment
                    };

                    if (string.Equals(checkInType, "Major", StringComparison.OrdinalIgnoreCase))
                        requestBody["checkInAs"] = "published";

                    // Execute POST request to check in the file
                    return await HttpClientHelper.PostAsync(requestUrl, requestBody, accessToken);
                }

            case nameof(M365SharePointActionsEnum.GetFileVersions):
                {
                    // Read full SharePoint file path
                    var filePath = CloudConnectionPayloadUtil.GetValue(payload, "filePath");

                    // Resolve document library (Drive) and file item ID
                    var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);
                    var itemId = await GetItemIdFromFilePathAsync(filePath, accessToken);

                    // Build Graph endpoint URL to fetch versions
                    var requestUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}/versions";

                    // Execute GET request and return the version metadata
                    return await HttpClientHelper.GetAsync(requestUrl, accessToken);
                }
            #endregion

            // ==========================
            // FOLDER / LIBRARY
            // ==========================
            case nameof(M365SharePointActionsEnum.GetDocumentLibraries):
                // Retrieve all document libraries
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/lists", accessToken);

            case nameof(M365SharePointActionsEnum.GetFoldersInLibrary):
                // Get all folders in a specific library
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/lists/{GetValue("libraryId")}/drive/root/children", accessToken);

            // case nameof(M365SharePointActionsEnum.CreateFolder):
            //     // Create new folder under parent
            //     return await HttpClientHelper.PostAsync($"{GRAPH_BASE_URL}/drive/items/{GetValue("parentFolderId")}/children",
            //         new { name = GetValue("folderName"), folder = new { }, "@microsoft.graph.conflictBehavior" = "rename" }, accessToken);

            case nameof(M365SharePointActionsEnum.RenameFolder):
                // Rename folder
                return await HttpClientHelper.PatchAsync($"{GRAPH_BASE_URL}/drive/items/{GetValue("folderId")}", new { name = GetValue("folderName") }, accessToken);

            case nameof(M365SharePointActionsEnum.DeleteFolder):
                // Delete folder
                return await HttpClientHelper.DeleteAsync($"{GRAPH_BASE_URL}/drive/items/{GetValue("folderId")}", accessToken);

            // ==========================
            // LIST ACTIONS
            // ==========================
            case nameof(M365SharePointActionsEnum.GetLists):
                // Retrieve all lists
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/lists", accessToken);

            case nameof(M365SharePointActionsEnum.GetListItems):
                // Get items in a list
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/lists/{GetValue("listId")}/items", accessToken);

            case nameof(M365SharePointActionsEnum.GetListItemById):
                // Get list item by ID
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/lists/{GetValue("listId")}/items/{GetValue("itemId")}", accessToken);

            case nameof(M365SharePointActionsEnum.CreateListItem):
                // Create new list item
                return await HttpClientHelper.PostAsync($"{GRAPH_BASE_URL}/lists/{GetValue("listId")}/items", payload, accessToken);

            case nameof(M365SharePointActionsEnum.UpdateListItem):
                // Update list item
                return await HttpClientHelper.PatchAsync($"{GRAPH_BASE_URL}/lists/{GetValue("listId")}/items/{GetValue("itemId")}", payload, accessToken);

            case nameof(M365SharePointActionsEnum.DeleteListItem):
                // Delete list item
                return await HttpClientHelper.DeleteAsync($"{GRAPH_BASE_URL}/lists/{GetValue("listId")}/items/{GetValue("itemId")}", accessToken);

            case nameof(M365SharePointActionsEnum.CreateList):
                // Create new list
                return await HttpClientHelper.PostAsync($"{GRAPH_BASE_URL}/lists", payload, accessToken);

            case nameof(M365SharePointActionsEnum.UpdateList):
                // Update list metadata
                return await HttpClientHelper.PatchAsync($"{GRAPH_BASE_URL}/lists/{GetValue("listId")}", payload, accessToken);

            case nameof(M365SharePointActionsEnum.DeleteList):
                // Delete a list
                return await HttpClientHelper.DeleteAsync($"{GRAPH_BASE_URL}/lists/{GetValue("listId")}", accessToken);

            // ==========================
            // PERMISSIONS / SHARING
            // ==========================
            case nameof(M365SharePointActionsEnum.GetUserPermissionsOnItem):
                // Get permissions for a user/item
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/drive/items/{GetValue("itemId")}/permissions", accessToken);

            case nameof(M365SharePointActionsEnum.GrantPermissions):
                // Grant permissions
                return await HttpClientHelper.PostAsync($"{GRAPH_BASE_URL}/drive/items/{GetValue("itemId")}/invite", payload, accessToken);

            case nameof(M365SharePointActionsEnum.RevokePermissions):
            case nameof(M365SharePointActionsEnum.ShareItemWithUser):
                // Requires Graph beta or REST API
                _logger.LogWarning("{Action} may require Graph beta or SharePoint REST API.", action);
                return null;

            // ==========================
            // METADATA / PROPERTIES
            // ==========================
            case nameof(M365SharePointActionsEnum.GetItemProperties):
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/drive/items/{GetValue("itemId")}", accessToken);

            case nameof(M365SharePointActionsEnum.UpdateItemProperties):
                return await HttpClientHelper.PatchAsync($"{GRAPH_BASE_URL}/drive/items/{GetValue("itemId")}", payload, accessToken);

            // ==========================
            // SEARCH
            // ==========================
            case nameof(M365SharePointActionsEnum.SearchFiles):
                return await HttpClientHelper.GetAsync($"{GRAPH_BASE_URL}/search/query", accessToken);

            case nameof(M365SharePointActionsEnum.SearchLists):
                _logger.LogWarning("{Action} not fully supported in Graph. Use SharePoint Search API.", action);
                return null;

            // ==========================
            // VERSIONING
            // ==========================
            case nameof(M365SharePointActionsEnum.EnableVersioningOnLibrary):
            case nameof(M365SharePointActionsEnum.DisableVersioningOnLibrary):
                _logger.LogWarning("{Action} requires SharePoint REST API.", action);
                return null;

            // ==========================
            // WORKFLOWS / ALERTS
            // ==========================
            case nameof(M365SharePointActionsEnum.CreateAlert):
            case nameof(M365SharePointActionsEnum.DeleteAlert):
            case nameof(M365SharePointActionsEnum.TriggerFlowOnItem):
                _logger.LogWarning("{Action} requires SharePoint REST API or Power Automate.", action);
                return null;

            // ==========================
            // DEFAULT / UNSUPPORTED
            // ==========================
            default:
                _logger.LogWarning("Unsupported SharePoint action requested: {Action}", action);
                return null;
        }
    }

    // Method to get Site ID
    public async Task<string> GetSiteIdFromFilePathAsync(string filePath, string accessToken)
    {
        var fileUrl = new Uri(filePath);
        var domain = GetDomain(fileUrl);
        var sitePath = GetSitePath(fileUrl, filePath);

        return await GetSiteIdAsync(domain, sitePath, accessToken);
    }

    // Method to get Drive ID
    public async Task<string> GetDriveIdFromFilePathAsync(string filePath, string accessToken)
    {
        var siteId = await GetSiteIdFromFilePathAsync(filePath, accessToken);
        return await GetDriveIdAsync(siteId, accessToken);
    }

    // Method to get Item ID
    private async Task<string> GetItemIdFromFilePathAsync(string filePath, string accessToken)
    {
        var fileUrl = new Uri(filePath);
        var relativeFilePath = GetRelativeFilePath(fileUrl);
        var driveId = await GetDriveIdFromFilePathAsync(filePath, accessToken);

        return await GetItemIdAsync(driveId, relativeFilePath, accessToken);
    }

    // Method to get the domain from the URL
    private string GetDomain(Uri fileUri)
    {
        return fileUri?.Host ?? string.Empty;  // Return empty string if URI is invalid or Host is null
    }

    // Method to get the site path from the URL
    private string GetSitePath(Uri fileUri, string fileUrl)
    {
        var segments = fileUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

        // Find the index of "sites" or "teams"
        int siteRootIdx = Array.FindIndex(segments, s => s.Equals("sites", StringComparison.OrdinalIgnoreCase) || s.Equals("teams", StringComparison.OrdinalIgnoreCase));

        if (siteRootIdx == -1)
        {
            _logger.LogWarning("Invalid SharePoint URL: missing 'sites' or 'teams' segment. URL: {FileUrl}", fileUrl);
            return string.Empty;  // Return empty string if URL structure is invalid
        }

        return "/" + string.Join('/', segments.Take(siteRootIdx + 2)); // e.g., /sites/YourCompanyName
    }

    // Method to get the relative file path from the URL
    private string GetRelativeFilePath(Uri fileUri)
    {
        var segments = fileUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        int siteRootIdx = Array.FindIndex(segments, s => s.Equals("sites", StringComparison.OrdinalIgnoreCase) || s.Equals("teams", StringComparison.OrdinalIgnoreCase));

        if (siteRootIdx == -1 || segments.Length <= siteRootIdx + 3)
        {
            _logger.LogWarning("Invalid file path in URL: {FileUrl}", fileUri);
            return string.Empty;  // Return empty string if file path is invalid
        }

        string relativeFilePath = string.Join('/', segments.Skip(siteRootIdx + 3)); // e.g., General/m365_connector_testing.xlsx
        return Uri.UnescapeDataString(relativeFilePath);
    }

    // Method to get the SharePoint site ID by calling the Graph API
    private async Task<string> GetSiteIdAsync(string domain, string sitePath, string accessToken)
    {
        var siteUrl = $"{GRAPH_BASE_URL}/sites/{domain}:{sitePath}";
        var siteJsonDocument = await HttpClientHelper.GetAsync(siteUrl, accessToken);

        // Return the site ID if it exists, otherwise return an empty string
        return siteJsonDocument?.RootElement.GetProperty("id").GetString() ?? string.Empty;
    }

    // Method to get the default drive ID associated with the site
    private async Task<string> GetDriveIdAsync(string siteId, string accessToken)
    {
        var driveUrl = $"{GRAPH_BASE_URL}/sites/{siteId}/drive";
        var driveJsonDocument = await HttpClientHelper.GetAsync(driveUrl, accessToken);

        // Return the drive ID if it exists, otherwise return an empty string
        return driveJsonDocument?.RootElement.GetProperty("id").GetString() ?? string.Empty;
    }

    // Method to get the file item ID by path (using the drive ID)
    private async Task<string> GetItemIdAsync(string driveId, string relativeFilePath, string accessToken)
    {
        var itemUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/root:/{relativeFilePath}";
        var itemJsonDocument = await HttpClientHelper.GetAsync(itemUrl, accessToken);

        // Return the item ID if it exists, otherwise return an empty string
        return itemJsonDocument.RootElement.GetProperty("id").GetString() ?? string.Empty;
    }

    private async Task<JsonDocument> DownloadFileWithMetadataAsync(string driveId, string itemId, string accessToken)
    {
        // First, get the file metadata to retrieve properties like name, size, and webUrl
        var metadataUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}";

        // Execute GET request to retrieve file metadata
        var metadataResponse = await HttpClientHelper.GetAsync(metadataUrl, accessToken);

        // Extract relevant metadata properties, providing defaults if they are missing
        var root = metadataResponse.RootElement;
        var name = root.GetProperty("name").GetString();
        var size = root.GetProperty("size").GetInt64();
        var webUrl = root.GetProperty("webUrl").GetString();
        string contentType = "application/octet-stream";

        // Attempt to get the MIME type from the file metadata if available
        if (root.TryGetProperty("file", out var fileProp) && fileProp.TryGetProperty("mimeType", out var mimeProp))
        {
            contentType = mimeProp.GetString()!;
        }

        // Build the Microsoft Graph endpoint URL to download the file content
        var contentUrl = $"{GRAPH_BASE_URL}/drives/{driveId}/items/{itemId}/content";

        // Use HttpClient to download the file content as a byte array. We need to set the Authorization header with the access token for authentication.
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Execute GET request to download the file content
        var fileResponse = await httpClient.GetAsync(contentUrl);

        // Ensure the request was successful
        var fileBytes = await fileResponse.Content.ReadAsByteArrayAsync();

        // Convert to Base64
        var base64Content = Convert.ToBase64String(fileBytes);

        // Construct the response object with metadata and content
        return JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(new
        {
            Name = name,
            Size = size,
            ContentType = contentType,
            WebUrl = webUrl,
            Base64 = base64Content,
            DownloadedAtUtc = DateTime.UtcNow
        }));
    }

    // Uploads a file to SharePoint/OneDrive using Microsoft Graph API.
    // This method sends a PUT request with the file byte content to the provided upload URL.
    private async Task<JsonDocument> UploadFileToSharePointAsync(string uploadUrl, byte[] fileBytes, string accessToken, string contentType = "application/octet-stream")
    {
        // Initialize HttpClient to make the HTTP request to Microsoft Graph
        using (var httpClient = new HttpClient())
        {
            // Attach the Bearer access token required for Graph API authentication
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // Create request content from the file byte array
            using (var content = new ByteArrayContent(fileBytes))
            {
                // Define the MIME type for the file being uploaded
                content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

                // Send a PUT request to upload or overwrite the file in SharePoint via Graph API
                var response = await httpClient.PutAsync(uploadUrl, content);

                // Retrieve the response body as a string
                var responseContent = await response.Content.ReadAsStringAsync();

                // Check if the request completed successfully (HTTP 2xx)
                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        // Parse the API response into a JsonDocument
                        return JsonDocument.Parse(responseContent);
                    }
                    catch (Exception ex)
                    {
                        // Handle JSON parsing errors and return a formatted error response
                        return JsonDocument.Parse(
                            $@"{{""statusCode"": {(int)response.StatusCode}, ""error"": ""Exception: {ex.Message.Replace("\"", "'")}""}}");
                    }
                }
                else
                {
                    // Return status code and error message if the API request fails
                    return JsonDocument.Parse(
                        $@"{{""statusCode"": {(int)response.StatusCode}, ""error"": ""Exception: {responseContent.Replace("\"", "'")}""}}");
                }
            }
        }
    }

    private async Task<byte[]> GetFileBytesFromUrlAsync(string fileUrl)
    {
        using (var httpClient = new HttpClient())
        {
            // Send GET request to download file
            var response = await httpClient.GetAsync(fileUrl);

            response.EnsureSuccessStatusCode();

            // Return file content as byte array
            return await response.Content.ReadAsByteArrayAsync();
        }
    }
}