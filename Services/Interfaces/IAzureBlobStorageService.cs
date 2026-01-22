namespace AspNetToolkit.Services;

/// <summary>
/// Provides operations for managing files and containers in Azure Blob Storage.
/// </summary>
public interface IAzureBlobStorageService
{
    /// <summary>
    /// Checks whether a file exists in the specified blob container.
    /// </summary>
    /// <param name="containerName">The name of the blob container.</param>
    /// <param name="fileName">The name of the file (blob).</param>
    /// <returns>True if the file exists; otherwise, false.</returns>
    Task<bool> FileExistsAsync(string containerName, string fileName);

    /// <summary>
    /// Uploads a file to the specified blob container.
    /// </summary>
    /// <param name="containerName">The name of the blob container.</param>
    /// <param name="fileStream">The stream containing the file data.</param>
    /// <param name="fileName">The name of the file (blob).</param>
    /// <param name="contentType">The MIME content type of the file.</param>
    /// <returns>The URI or identifier of the uploaded file.</returns>
    Task<string> UploadFileAsync(string containerName, Stream fileStream, string fileName, string contentType);

    /// <summary>
    /// Downloads a file from the specified blob container in Azure Blob Storage.
    /// </summary>
    /// <param name="containerName">The name of the blob container.</param>
    /// <param name="fileName">The name of the file (including extension) to download.</param>
    /// <returns>
    /// A <see cref="FileStreamContentResponseDto"/> containing the file's content, MIME type, and name.
    /// </returns>
    Task<FileStreamContentResponseDto> DownloadFileAsync(string containerName, string fileName);

    /// <summary>
    /// Deletes a file from the specified blob container.
    /// </summary>
    /// <param name="containerName">The name of the blob container.</param>
    /// <param name="fileName">The name of the file (blob).</param>
    /// <returns>True if the file was deleted successfully; otherwise, false.</returns>
    Task<bool> DeleteFileAsync(string containerName, string fileName);

    // ----------------------------------------------------------------------

    /// <summary>
    /// Creates a new blob container if it does not already exist.
    /// </summary>
    /// <param name="containerName">The name of the container to create.</param>
    Task CreateContainerAsync(string containerName);

    /// <summary>
    /// Deletes an existing blob container.
    /// </summary>
    /// <param name="containerName">The name of the container to delete.</param>
    Task DeleteContainerAsync(string containerName);

    /// <summary>
    /// Calculates the total size of all blobs within the specified container.
    /// </summary>
    /// <param name="containerName">The name of the blob container.</param>
    /// <returns>The total size of the container in bytes.</returns>
    Task<long> GetContainerSizeAsync(string containerName);

    // ----------------------------------------------------------------------

    /// <summary>
    /// Generates a Shared Access Signature (SAS) token for a specific file.
    /// </summary>
    /// <param name="containerName">The name of the blob container.</param>
    /// <param name="fileName">The name of the file (blob).</param>
    /// <param name="tokenLifetimeMinutes">The duration, in minutes, that the SAS token remains valid.</param>
    /// <returns>A SAS token granting temporary access to the file.</returns>
    string GenerateSasToken(string containerName, string fileName, int tokenLifetimeMinutes);
}
