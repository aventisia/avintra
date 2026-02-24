namespace WorkspaceAPIs.Features.CloudConnectors.M365.SharePoint;

public enum M365SharePointActionsEnum
{
    // File / Document Library Actions
    GetFileById,
    GetFileByPath,
    GetFilesInFolder,
    UploadFile,
    UpdateFile,
    DeleteFile,
    DownloadFile,
    CopyFile,
    MoveFile,
    CheckOutFile,
    CheckInFile,
    RestoreFileVersion,
    GetFileVersions,

    // Folder / Library Actions
    GetDocumentLibraries,
    GetFoldersInLibrary,
    CreateFolder,
    RenameFolder,
    DeleteFolder,

    // List Actions
    GetListItems,
    GetListItemById,
    CreateListItem,
    UpdateListItem,
    DeleteListItem,
    GetLists,
    CreateList,
    UpdateList,
    DeleteList,

    // Site Actions
    GetSiteById,
    GetSiteByUrl,
    GetSubSites,
    CreateSubSite,
    UpdateSiteProperties,
    DeleteSite,

    // Permissions / Sharing
    GetUserPermissionsOnItem,
    GrantPermissions,
    RevokePermissions,
    ShareItemWithUser,

    // Metadata / Properties
    GetItemProperties,
    UpdateItemProperties,

    // Search
    SearchFiles,
    SearchLists,
    SearchSites,

    // Versioning
    EnableVersioningOnLibrary,
    DisableVersioningOnLibrary,

    // Workflow / Alerts (if using SharePoint Designer or modern flows)
    CreateAlert,
    DeleteAlert,
    TriggerFlowOnItem
}
