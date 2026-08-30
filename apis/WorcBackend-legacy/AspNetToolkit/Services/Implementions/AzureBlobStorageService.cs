using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;

namespace AspNetToolkit.Services;

public class AzureBlobStorageService : IAzureBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<AzureBlobStorageService> _logger;
    private readonly EnvironmentConfig _environmentConfig;

    public AzureBlobStorageService(
        ILogger<AzureBlobStorageService> logger,
        EnvironmentConfig environmentConfig)
    {
        _logger = logger;
        _blobServiceClient = new BlobServiceClient(environmentConfig.AzureBlobStorageConnectionString);
        _environmentConfig = environmentConfig;
    }

    // Checks whether a blob exists in the specified container.
    public async Task<bool> FileExistsAsync(string containerName, string fileName)
    {
        // Get a client for the specified container.
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Get a client for the specific blob within the container.
        var blobClient = containerClient.GetBlobClient(fileName);

        _logger.LogDebug("Checking existence of blob '{FileName}' in container '{ContainerName}'.", fileName, containerName);

        // Executes a lightweight HEAD request against Azure Storage.
        var exists = await blobClient.ExistsAsync();

        // Return whether the blob exists.
        return exists.Value;
    }


    public async Task<string> UploadFileAsync(string containerName, Stream fileStream, string fileName, string contentType)
    {
        // Validate that the input stream is not null.
        ArgumentNullException.ThrowIfNull(fileStream);

        // Ensure the stream is readable to avoid runtime errors during upload.
        if (!fileStream.CanRead)
            throw new ArgumentException("File stream must be readable.", nameof(fileStream));


        try
        {
            // Get a client for the specified blob container.
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

            // Ensure the container exists.
            await containerClient.CreateIfNotExistsAsync();

            // Get a client for the specific blob (destination file) in the container.
            var blobClient = containerClient.GetBlobClient(fileName);

            // Upload the stream to the blob.
            await blobClient.UploadAsync(fileStream,
                new BlobHttpHeaders
                {
                    ContentType = contentType
                });

            _logger.LogInformation("Blob '{FileName}' uploaded successfully.", fileName);

            // Return the full URI of the uploaded blob.
            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload blob '{FileName}' to container '{ContainerName}'.", fileName, containerName);
            throw;
        }
    }

    // Downloads a blob from Azure Blob Storage.
    public async Task<FileStreamContentResponseDto> DownloadFileAsync(string containerName, string fileName)
    {

        // Get a client for the specified blob container.
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Get a client for the specific blob (file) within the container.
        var blobClient = containerClient.GetBlobClient(fileName);

        // Check if the blob exists before attempting to download.
        if (!await blobClient.ExistsAsync())
            throw new FileNotFoundException("Blob not found.", fileName);

        // Download the blob.
        var response = await blobClient.DownloadAsync();

        // Return the blob content along with its MIME type and file name
        return new FileStreamContentResponseDto()
        {
            Content = response.Value.Content,
            ContentType = response.Value.Details.ContentType ?? "application/octet-stream",
            Name = fileName,
        };
    }

    // Deletes a blob if it exists.
    public async Task<bool> DeleteFileAsync(string containerName, string fileName)
    {

        // Get a client for the specified blob container.
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Get a client for the specific blob (file) within the container.
        var blobClient = containerClient.GetBlobClient(fileName);

        // Delete the blob only if it exists.
        var response = await blobClient.DeleteIfExistsAsync();

        // Return whether the blob was successfully deleted.
        return response.Value;
    }

    // Creates a blob container if it does not already exist.
    public async Task CreateContainerAsync(string containerName)
    {
        // Get a client for the specified blob container.
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Create the container only if it does not already exist.
        await containerClient.CreateIfNotExistsAsync();
    }

    // Deletes the blob container if it exists.
    public async Task<bool> RemoveContainerAsync(string containerName)
    {
        // Get the container client.
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Check if the container exists.
        var containerExists = await containerClient.ExistsAsync();

        // If the container does not exist, log the message and return true (no need to delete).
        if (!containerExists)
        {
            return true;
        }

        // Delete the container if it exists and return whether it was successful.
        var result = await containerClient.DeleteIfExistsAsync();

        return result.Value;
    }

    // Calculates the total size of all blobs within a container.
    public async Task<long> GetContainerSizeAsync(string containerName)
    {
        // Get a client for the specified blob container.
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Ensure the container exists.
        await containerClient.CreateIfNotExistsAsync();

        // Accumulator for the total size of all blobs in the container.
        long totalSize = 0;

        // Enumerate all blobs in the container asynchronously.
        await foreach (var blobItem in containerClient.GetBlobsAsync())
        {
            // ContentLength may be null for certain blob types,
            // so fall back to 0 in those cases.
            totalSize += blobItem.Properties.ContentLength ?? 0;
        }

        // Return the total size in bytes.
        return totalSize;
    }

    // Generates a read-only Shared Access Signature (SAS) token for a blob.
    public string GenerateSasToken(string containerName, string fileName, int tokenLifetimeMinutes)
    {
        // Get a client for the target blob container.
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

        // Get a client for the specific blob (file) within the container.
        var blobClient = containerClient.GetBlobClient(fileName);

        // SAS generation is only supported when the BlobClient is created using credentials that allow signing (e.g., account key or user delegation key).
        if (!blobClient.CanGenerateSasUri)
            throw new InvalidOperationException(
                "BlobClient cannot generate SAS URI. Ensure proper credentials are configured.");

        // Generate a SAS URI that grants read-only access to the blob and expires after the specified duration.
        var sasUri = blobClient.GenerateSasUri(
            BlobSasPermissions.Read,
            DateTimeOffset.UtcNow.AddMinutes(tokenLifetimeMinutes));

        // Return the full SAS URI as a string.
        return sasUri.ToString();
    }

    // Retrieves the sizes of specified containers in the Azure Blob Storage account. If no container names are provided, it retrieves the sizes for all containers.
    public async Task<Dictionary<string, long>> GetAllContainersWithSizeAsync(List<string>? containerNames)
    {
        // Initialize a list to hold tasks for parallel execution
        var tasks = new List<Task<KeyValuePair<string, long>>>();

        // Iterate over each container in the storage account
        await foreach (var container in _blobServiceClient.GetBlobContainersAsync())
        {
            // If containerNames is provided and it contains the current container's name, include it
            if (containerNames == null || containerNames.Contains(container.Name))
            {
                // Add a task to calculate the size for this container
                tasks.Add(GetSize(container.Name));
            }
        }

        // Wait for all tasks to complete in parallel
        var results = await Task.WhenAll(tasks);

        // Convert the results into a dictionary: ContainerName -> SizeInBytes
        return results.ToDictionary(x => x.Key, x => x.Value);

        // Helper method to calculate the total size of a specific container.
        // Iterates over all blobs in the container and sums their sizes.
        async Task<KeyValuePair<string, long>> GetSize(string containerName)
        {
            // Get a reference to the container using the container name
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

            // Initialize the total size of the container to zero
            long totalSize = 0;

            // Iterate through all blobs in the container
            await foreach (var blob in containerClient.GetBlobsAsync())
            {
                // Safely add the size of each blob (handle null ContentLength gracefully)
                totalSize += blob.Properties.ContentLength ?? 0;
            }

            // Return a key-value pair: ContainerName -> TotalSizeInBytes
            return new KeyValuePair<string, long>(containerName, totalSize);
        }
    }
}