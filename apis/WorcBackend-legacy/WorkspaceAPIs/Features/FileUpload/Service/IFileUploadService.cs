namespace WorkspaceAPIs.Services;

public interface IFileUploadService
{
    /// <summary>
    /// Upload multiple files
    /// </summary>
    /// <param name="files">List of files</param>
    /// <returns></returns>
    Task<ServiceResponse<string[]>> UploadFilesAsync(IFormFile[]? files, bool isTemp = true);

    /// <summary>
    /// Upload single file
    /// </summary>
    /// <param name="file">file</param>
    /// <returns></returns>
    Task<ServiceResponse<string>> UploadFileAsync(IFormFile file, bool isTemp = true);

    /// <summary>
    /// Delete file
    /// </summary>
    /// <param name="fileUrl">File Url</param>
    /// <returns>True if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteFileAsync(string fileUrl);

    /// <summary>
    /// Delete file
    /// </summary>
    /// <param name="fileUrl">File Url</param>
    /// <returns>True if delete job is successful, else false</returns>
    Task<ServiceResponse<string>> GetFileByUrlOrFileIdAsync(string fileOrRemoteUrl, bool isTemp = true);

    /// <summary>
    /// Upload a file from the local system to the cloud.
    /// </summary>
    /// <returns>A response indicating whether the upload was successful or not.</returns>
    Task<ServiceResponse<bool>> UploadFileLocalToCloudAsync();

    /// <summary>
    /// Retrieves the data URL for the specified file.
    /// </summary>
    /// <param name="credentialName">The credential name used to authorize access to the file.</param>
    /// <param name="fileUrl">The URL of the file.</param>
    /// <returns>Returns the data URL of the specified file.</returns>
    Task<ServiceResponse<string>> GetDataUrlAsync(string? credentialName, string fileUrl);
}