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
    /// Uploads and stores metadata for a collection of uploaded documents.
    /// </summary>
    /// <param name="uploadDataList">A list of document metadata to be saved.</param>
    /// <returns>A service response containing the saved document records.</returns>
    Task<ServiceResponse<IList<UploadedDocDto>>> UploadDataFilesAsync(UploadDataDto uploadDataDto);

    /// <summary>
    /// Get list of uploaded docs
    /// </summary>
    /// <param name="mlModelId"></param>
    /// <param name="type"></param>
    /// <returns>A list of uploaded docs associated with specific ML model and of a specific type </returns>
    Task<ServiceResponse<IEnumerable<UploadedDocDto>>> GetUploadedDocsAsync(Guid mlModelId, ExtractedDataType type);

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

    /// <summary>
    /// Deletes an uploaded document by its unique identifier.
    /// </summary>
    /// <param name="documentId">The unique identifier of the uploaded document to delete.</param>
    /// <returns>A <see cref="ServiceResponse{Boolean}"/> indicating the result of the deletion operation.</returns>
    Task<ServiceResponse<bool>> DeleteUploadedDocAsync(Guid documentId);
}