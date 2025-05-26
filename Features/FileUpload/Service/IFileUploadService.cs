namespace WorkspaceAPIs.Services;

public interface IFileUploadService
{
    /// <summary>
    /// Upload multiple files
    /// </summary>
    /// <param name="files">List of files</param>
    /// <returns></returns>
    Task<ServiceResponse<string[]>> UploadFilesAsync(IFormFile[] files);

    /// <summary>
    /// Upload single file
    /// </summary>
    /// <param name="file">file</param>
    /// <returns></returns>
    Task<ServiceResponse<string>> UploadFileAsync(IFormFile file);

    /// <summary>
    /// Delete file
    /// </summary>
    /// <param name="fileUrl">File Url</param>
    /// <returns>True if delete job is successful, else false</returns>
    ServiceResponse<bool> DeleteFileAsync(string fileUrl);
}