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
    /// Insert uploaded doc record
    /// </summary>
    /// <param name="uploadedDocDto"> Uploaded Doc Dto</param>
    /// <returns>Uploaded doc record</returns>
    Task<ServiceResponse<UploadedDocDto>> InsertUploadedDocAsync(UploadedDocDto uploadedDocDto);

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