namespace MLModelBuilderAPIs.Services;

public interface IVersionResourceService
{
    /// <summary>
    /// Inserts new records for uploaded documents.
    /// </summary>
    /// <param name="versionResourcesDto">A list of document DTOs representing the uploaded documents.</param>
    /// <returns>A service response containing the inserted document records.</returns>
    Task<ServiceResponse<List<VersionResourceDto>>> InsertVersionResourcesAsync(List<VersionResourceDto> versionResourcesDto);

    /// <summary>
    /// Deletes a specific uploaded document by its unique identifier.
    /// </summary>
    /// <param name="versionResourceId">The unique ID of the document to be deleted.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteVersionResourceAsync(Guid versionResourceId);

    /// <summary>
    /// Deletes multiple uploaded documents using their unique identifiers.
    /// </summary>
    /// <param name="versionResourceIds">A list of unique IDs representing the documents to be deleted.</param>
    /// <returns>A service response indicating the result of the bulk deletion operation.</returns>
    Task<ServiceResponse<bool>> DeleteVersionResourcesAsync(List<Guid> versionResourceIds);

    /// <summary>
    /// Deletes all uploaded documents associated with a specific AI project version.
    /// </summary>
    /// <param name="aiProjectVersionId">The unique identifier of the AI project version.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteVersionResourceByAIProjectVersionAsync(Guid aiProjectVersionId);

    /// <summary>
    /// Uploads document files and saves their associated metadata.
    /// </summary>
    /// <param name="uploadVersionResourceDto">The DTO containing document metadata and file information.</param>
    /// <returns>A service response containing the uploaded document records.</returns>
    Task<ServiceResponse<List<VersionResourceDto>>> UploadVersionResourceFilesAsync(UploadVersionResourceDto uploadVersionResourceDto);

    /// <summary>
    /// Retrieves uploaded documents based on AI project version ID.
    /// </summary>
    /// <param name="aiProjectVersionId">The unique identifier of the AI project version.</param>
    /// <returns>A service response containing the matching uploaded document records.</returns>
    Task<ServiceResponse<IEnumerable<VersionResourceDto>>> GetVersionResourcesAsync(Guid aiProjectVersionId);

    /// <summary>
    /// Upload a collection of files for a specific purpose.
    /// </summary>
    /// <param name="files">A list of files to be uploaded.</param>
    /// <param name="purpose">The intended purpose of the file upload (e.g., Identification, Contract, etc.).</param>
    /// <returns>A task that represents the asynchronous operation, with a response containing details of the uploaded files.</returns>
    Task<ServiceResponse<IEnumerable<FileDetailDto>>> UploadFilesAsync(List<IFormFile> files, DocumentPurposeTypesEnum purpose);

    /// <summary>
    /// Remove a file using its URL.
    /// </summary>
    /// <param name="fileUrl">The URL of the file to be deleted.</param>
    /// <returns>A response indicating whether the file deletion was successful (true) or not (false).</returns>
    Task<ServiceResponse<bool>> DeleteFileAsync(string fileUrl);

    /// <summary>
    /// Retrieve a file using its URL.
    /// </summary>
    /// <param name="fileUrl">The URL of the file to be downloaded.</param>
    /// <returns>A response containing the file details.</returns>
    Task<ServiceResponse<FileStreamContentResponseDto>> DownloadFileAsync(string fileUrl);

    /// <summary>
    /// Upload a file from the local system to the cloud.
    /// </summary>
    /// <returns>A response indicating whether the upload was successful or not.</returns>
    Task<ServiceResponse<bool>> UploadFileLocalToCloudAsync();
}