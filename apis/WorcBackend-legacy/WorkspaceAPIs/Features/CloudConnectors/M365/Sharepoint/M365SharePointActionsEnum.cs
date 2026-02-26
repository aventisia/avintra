namespace WorkspaceAPIs.Features.CloudConnectors.M365.SharePoint;

public enum M365SharePointActionsEnum
{
    // File / Document Library Actions
    UploadFile,
    UpdateFile,
    DeleteFile,
    DownloadFile,
    GetFileById,
    GetFileByPath,
    GetDriveFiles,
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
    GetSites,
    CreateSite,
    GetSiteById,
    GetSiteByUrl,
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
