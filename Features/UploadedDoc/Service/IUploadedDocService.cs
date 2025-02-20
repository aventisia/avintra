namespace MLModelBuilderAPIs.Services;

public interface IUploadedDocService
{
    /// <summary>
    /// Upload multiple files
    /// </summary>
    /// <param name="files">List of files</param>
    /// <returns></returns>
    Task<ServiceResponse<IEnumerable<FileDetailDto>>> UploadFilesAsync(List<IFormFile> files);

    /// <summary>
    /// Insert uploaded doc records
    /// </summary>
    /// <param name="uploadedDocList">List of Uploaded Doc Dto</param>
    /// <returns>Uploaded doc records</returns>
    Task<ServiceResponse<IList<UploadedDocDto>>> InsertUploadedDocAsync(IList<UploadedDocDto> uploadedDocList);

    /// <summary>
    /// Retrieves the list of uploaded docs
    /// </summary>
    /// <param name="mlModelId"></param>
    /// <returns>List of uploaded docs</returns>
    Task<ServiceResponse<IEnumerable<UploadedDocDto>>> GetUploadedDocsAsync(Guid mlModelId);

    /// <summary>
    /// Delete file
    /// </summary>
    /// <param name="fileUrl">File Url</param>
    /// <returns>True if delete job is successful, else false</returns>
    ServiceResponse<bool> DeleteFileAsync(string fileUrl);

    /// <summary>
    /// Download files
    /// </summary>
    /// <param name="fileUrl"></param>
    /// <returns></returns>
    ServiceResponse<FileDetailDto> DownloadFileAsync(string fileUrl);
}