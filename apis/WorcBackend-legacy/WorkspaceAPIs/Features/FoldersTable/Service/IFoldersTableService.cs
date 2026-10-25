namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing folders that group agents.
/// </summary>
public interface IFoldersTableService
{
    /// <summary>
    /// Retrieves list of folders in the current space.
    /// </summary>
    /// <returns>A service response containing the folders.</returns>
    Task<ServiceResponse<IEnumerable<FoldersTableRowDto>>> GetFoldersAsync();

    /// <summary>
    /// Inserts a new folder.
    /// </summary>
    /// <param name="insertFolderDto">The folder details.</param>
    /// <returns>A service response containing the inserted folder.</returns>
    Task<ServiceResponse<FoldersTableRowDto>> InsertFolderAsync(InsertFolderDto insertFolderDto);

    /// <summary>
    /// Updates an existing folder.
    /// </summary>
    /// <param name="updateFolderDto">The updated folder details.</param>
    /// <returns>A service response containing the updated folder.</returns>
    Task<ServiceResponse<FoldersTableRowDto>> UpdateFolderAsync(UpdateFolderDto updateFolderDto);

    /// <summary>
    /// Deletes an existing folder; its agents return to the top level.
    /// </summary>
    /// <param name="folderId">The unique identifier of the folder.</param>
    /// <returns>A service response indicating whether the folder was deleted.</returns>
    Task<ServiceResponse<bool>> DeleteFolderAsync(Guid folderId);
}
