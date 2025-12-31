namespace AspNetToolkit.Services;

public interface IUploadFileService
{
    /// <summary>
    /// Asynchronously uploads a single file and returns the result in a service response.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <returns>A service response containing the upload status and details.</returns>
    Task<ServiceResponse<FileUploadResponseDto>> UploadSingleFileAsync(IFormFile file);

    /// <summary>
    /// Upload a list of files.
    /// </summary>
    /// <param name="files">A collection of files to upload.</param>
    /// <returns>A task that represents the asynchronous upload operation, containing the response details.</returns>
    Task<ServiceResponse<IEnumerable<FileUploadResponseDto>>> UploadFilesAsync(List<IFormFile> files);

    /// <summary>
    /// Upload a list of files to temparory.
    /// </summary>
    /// <param name="files">A collection of files to upload.</param>
    /// <returns>A task that represents the asynchronous upload operation, containing the response details.</returns>
    Task<ServiceResponse<IEnumerable<FileUploadResponseDto>>> UploadFilesTemporaryAsync(List<IFormFile> files);

    /// <summary>
    /// Remove a specified file.
    /// </summary>
    /// <param name="fileUrl">The URL of the file to be deleted.</param>
    /// <returns>Returns true if the deletion was successful; otherwise, returns false.</returns>
    ServiceResponse<bool> DeleteFileAsync(string fileUrl, bool isTemp = false);

    /// <summary>
    /// Retrieve a file for download.
    /// </summary>
    /// <param name="fileUrl">The URL of the file to download.</param>
    /// <returns>The response containing details about the downloaded file.</returns>
    ServiceResponse<FileUploadResponseDto> DownloadFileAsync(string fileUrl, bool isTemp = false);

    /// <summary>
    /// Retrieve a file for download from remote server.
    /// </summary>
    /// <param name="fileUrl">The  remote URL of the file to download.</param>
    /// <returns>The response is path of the downloaded file.</returns>
    Task<ServiceResponse<string>> DownloadFileOnServerAsync(string fileUrl, bool isTemp = false);

}
