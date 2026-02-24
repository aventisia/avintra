namespace WorkspaceAPIs.Features.CloudConnectors.M365.SharePoint;

public class M365SharePointConnectorsService : IM365SharePointConnectorsService
{
    private readonly ILogger<M365SharePointConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;

    public M365SharePointConnectorsService(
        ILogger<M365SharePointConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
    }

    /// <summary>
    /// Entry point for invoking M365 SharePoint cloud connector actions
    /// </summary>
    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(
        CloudConnectorReqDto cloudConnectorReqDto)
    {
        // ==========================
        // 1. Validate input request
        // ==========================
        if (cloudConnectorReqDto == null)
        {
            _logger.LogWarning("InvokeCloudConnectorAsync called with null request.");
            throw new ArgumentNullException(nameof(cloudConnectorReqDto));
        }

        // ==========================
        // 2. Initialize response
        // Default StatusCode = 400 (Bad Request)
        // ==========================
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
            _logger.LogInformation("Invoking SharePoint connector. Action: {Action}", cloudConnectorReqDto.Action);

            // ==========================
            // 3. Validate the action against enum
            // ==========================
            if (!Enum.TryParse<M365SharePointActionsEnum>(cloudConnectorReqDto.Action, true, out var parsedAction))
            {
                _logger.LogWarning("Invalid SharePoint action requested: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = "Invalid SharePoint action.";
                return serviceResponse;
            }

            // ==========================
            // 4. Retrieve M365 access token
            // ==========================
            var accessToken = await _m365ConnectorsService.GetM365AccessTokenAsync(cloudConnectorReqDto.CredentialId);
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogWarning("Failed to retrieve M365 access token for CredentialId: {CredentialId}", cloudConnectorReqDto.CredentialId);
                serviceResponse.Message = "Failed to obtain M365 access token.";
                return serviceResponse;
            }

            // ==========================
            // 5. Prepare payload
            // Ensure payload dictionary is non-null
            // ==========================
            var payload = cloudConnectorReqDto.Payload ?? new Dictionary<string, object>();

            // ==========================
            // 6. Execute the requested SharePoint action
            // ==========================
            var result = await TakeM365SharePointActionAsync(cloudConnectorReqDto.Action, accessToken, payload);

            // ==========================
            // 7. Handle failed action execution
            // ==========================
            if (result == null)
            {
                _logger.LogWarning("Action execution failed: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = "M365 SharePoint connector action failed.";
                return serviceResponse;
            }

            // ==========================
            // 8. Set successful response
            // ==========================
            serviceResponse.Data.Response = result;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "M365 SharePoint connector invoked successfully.";
            _logger.LogInformation("Action executed successfully: {Action}", cloudConnectorReqDto.Action);
        }
        catch (Exception ex)
        {
            // ==========================
            // 9. Handle unexpected errors
            // ==========================
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

        string baseUrl = $"{_m365ConnectorsService.GRAPH_BASE_URL}/sites/root";

        switch (action)
        {
            // ==========================
            // FILE / DOCUMENT LIBRARY
            // ==========================
            case nameof(M365SharePointActionsEnum.GetFileById):
                // Retrieve file by ID
                return await HttpClientHelper.GetAsync($"{baseUrl}/drive/items/{GetValue("fileId")}", accessToken);

            case nameof(M365SharePointActionsEnum.GetFileByPath):
                // Retrieve file by path
                return await HttpClientHelper.GetAsync($"{baseUrl}/drive/root:/{GetValue("filePath")}", accessToken);

            case nameof(M365SharePointActionsEnum.GetFilesInFolder):
                // List all files in a folder
                return await HttpClientHelper.GetAsync($"{baseUrl}/drive/items/{GetValue("folderId")}/children", accessToken);

            case nameof(M365SharePointActionsEnum.UploadFile):
                // Upload a new file to SharePoint
                return await HttpClientHelper.PutAsync($"{baseUrl}/drive/root:/{GetValue("filePath")}:/content", GetValue("contentBytes"), accessToken);

            case nameof(M365SharePointActionsEnum.UpdateFile):
                // Update file metadata (e.g., rename)
                return await HttpClientHelper.PatchAsync($"{baseUrl}/drive/items/{GetValue("fileId")}", new { name = GetValue("fileName") }, accessToken);

            case nameof(M365SharePointActionsEnum.DeleteFile):
                // Delete file by ID
                return await HttpClientHelper.DeleteAsync($"{baseUrl}/drive/items/{GetValue("fileId")}", accessToken);

            case nameof(M365SharePointActionsEnum.DownloadFile):
                // Download file content
                return await HttpClientHelper.GetAsync($"{baseUrl}/drive/items/{GetValue("fileId")}/content", accessToken);

            case nameof(M365SharePointActionsEnum.CopyFile):
                // Copy file to a new folder with optional rename
                return await HttpClientHelper.PostAsync($"{baseUrl}/drive/items/{GetValue("fileId")}/copy",
                    new { parentReference = new { id = GetValue("destinationFolderId") }, name = GetValue("newFileName") }, accessToken);

            case nameof(M365SharePointActionsEnum.MoveFile):
                // Move file to a different folder
                return await HttpClientHelper.PatchAsync($"{baseUrl}/drive/items/{GetValue("fileId")}",
                    new { parentReference = new { id = GetValue("destinationFolderId") } }, accessToken);

            case nameof(M365SharePointActionsEnum.CheckOutFile):
            case nameof(M365SharePointActionsEnum.CheckInFile):
            case nameof(M365SharePointActionsEnum.RestoreFileVersion):
                // Requires SharePoint REST API
                _logger.LogWarning("{Action} may require SharePoint REST API.", action);
                return null;

            case nameof(M365SharePointActionsEnum.GetFileVersions):
                // Retrieve file version history
                return await HttpClientHelper.GetAsync($"{baseUrl}/drive/items/{GetValue("fileId")}/versions", accessToken);

            // ==========================
            // FOLDER / LIBRARY
            // ==========================
            case nameof(M365SharePointActionsEnum.GetDocumentLibraries):
                // Retrieve all document libraries
                return await HttpClientHelper.GetAsync($"{baseUrl}/lists", accessToken);

            case nameof(M365SharePointActionsEnum.GetFoldersInLibrary):
                // Get all folders in a specific library
                return await HttpClientHelper.GetAsync($"{baseUrl}/lists/{GetValue("libraryId")}/drive/root/children", accessToken);

            // case nameof(M365SharePointActionsEnum.CreateFolder):
            //     // Create new folder under parent
            //     return await HttpClientHelper.PostAsync($"{baseUrl}/drive/items/{GetValue("parentFolderId")}/children",
            //         new { name = GetValue("folderName"), folder = new { }, "@microsoft.graph.conflictBehavior" = "rename" }, accessToken);

            case nameof(M365SharePointActionsEnum.RenameFolder):
                // Rename folder
                return await HttpClientHelper.PatchAsync($"{baseUrl}/drive/items/{GetValue("folderId")}", new { name = GetValue("folderName") }, accessToken);

            case nameof(M365SharePointActionsEnum.DeleteFolder):
                // Delete folder
                return await HttpClientHelper.DeleteAsync($"{baseUrl}/drive/items/{GetValue("folderId")}", accessToken);

            // ==========================
            // LIST ACTIONS
            // ==========================
            case nameof(M365SharePointActionsEnum.GetLists):
                // Retrieve all lists
                return await HttpClientHelper.GetAsync($"{baseUrl}/lists", accessToken);

            case nameof(M365SharePointActionsEnum.GetListItems):
                // Get items in a list
                return await HttpClientHelper.GetAsync($"{baseUrl}/lists/{GetValue("listId")}/items", accessToken);

            case nameof(M365SharePointActionsEnum.GetListItemById):
                // Get list item by ID
                return await HttpClientHelper.GetAsync($"{baseUrl}/lists/{GetValue("listId")}/items/{GetValue("itemId")}", accessToken);

            case nameof(M365SharePointActionsEnum.CreateListItem):
                // Create new list item
                return await HttpClientHelper.PostAsync($"{baseUrl}/lists/{GetValue("listId")}/items", payload, accessToken);

            case nameof(M365SharePointActionsEnum.UpdateListItem):
                // Update list item
                return await HttpClientHelper.PatchAsync($"{baseUrl}/lists/{GetValue("listId")}/items/{GetValue("itemId")}", payload, accessToken);

            case nameof(M365SharePointActionsEnum.DeleteListItem):
                // Delete list item
                return await HttpClientHelper.DeleteAsync($"{baseUrl}/lists/{GetValue("listId")}/items/{GetValue("itemId")}", accessToken);

            case nameof(M365SharePointActionsEnum.CreateList):
                // Create new list
                return await HttpClientHelper.PostAsync($"{baseUrl}/lists", payload, accessToken);

            case nameof(M365SharePointActionsEnum.UpdateList):
                // Update list metadata
                return await HttpClientHelper.PatchAsync($"{baseUrl}/lists/{GetValue("listId")}", payload, accessToken);

            case nameof(M365SharePointActionsEnum.DeleteList):
                // Delete a list
                return await HttpClientHelper.DeleteAsync($"{baseUrl}/lists/{GetValue("listId")}", accessToken);

            // ==========================
            // SITE ACTIONS
            // ==========================
            case nameof(M365SharePointActionsEnum.GetSiteById):
                // Retrieve site by ID
                return await HttpClientHelper.GetAsync($"{_m365ConnectorsService.GRAPH_BASE_URL}/sites/{GetValue("siteId")}", accessToken);

            case nameof(M365SharePointActionsEnum.GetSiteByUrl):
                // Retrieve site by URL
                return await HttpClientHelper.GetAsync($"{_m365ConnectorsService.GRAPH_BASE_URL}/sites/{GetValue("hostname")}:/sites/{GetValue("sitePath")}", accessToken);

            case nameof(M365SharePointActionsEnum.GetSubSites):
                // List sub-sites
                return await HttpClientHelper.GetAsync($"{baseUrl}/sites", accessToken);

            case nameof(M365SharePointActionsEnum.CreateSubSite):
            case nameof(M365SharePointActionsEnum.UpdateSiteProperties):
            case nameof(M365SharePointActionsEnum.DeleteSite):
                // Not fully supported via Graph
                _logger.LogWarning("{Action} not fully supported in Graph. Use SharePoint REST API.", action);
                return null;

            // ==========================
            // PERMISSIONS / SHARING
            // ==========================
            case nameof(M365SharePointActionsEnum.GetUserPermissionsOnItem):
                // Get permissions for a user/item
                return await HttpClientHelper.GetAsync($"{baseUrl}/drive/items/{GetValue("itemId")}/permissions", accessToken);

            case nameof(M365SharePointActionsEnum.GrantPermissions):
                // Grant permissions
                return await HttpClientHelper.PostAsync($"{baseUrl}/drive/items/{GetValue("itemId")}/invite", payload, accessToken);

            case nameof(M365SharePointActionsEnum.RevokePermissions):
            case nameof(M365SharePointActionsEnum.ShareItemWithUser):
                // Requires Graph beta or REST API
                _logger.LogWarning("{Action} may require Graph beta or SharePoint REST API.", action);
                return null;

            // ==========================
            // METADATA / PROPERTIES
            // ==========================
            case nameof(M365SharePointActionsEnum.GetItemProperties):
                return await HttpClientHelper.GetAsync($"{baseUrl}/drive/items/{GetValue("itemId")}", accessToken);

            case nameof(M365SharePointActionsEnum.UpdateItemProperties):
                return await HttpClientHelper.PatchAsync($"{baseUrl}/drive/items/{GetValue("itemId")}", payload, accessToken);

            // ==========================
            // SEARCH
            // ==========================
            case nameof(M365SharePointActionsEnum.SearchFiles):
                return await HttpClientHelper.GetAsync($"{_m365ConnectorsService.GRAPH_BASE_URL}/search/query", accessToken);

            case nameof(M365SharePointActionsEnum.SearchLists):
            case nameof(M365SharePointActionsEnum.SearchSites):
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
}
