namespace AspNetToolkit.Services;

public class UploadFileService : IUploadFileService
{
    private readonly ILogger<UploadFileService> _logger;
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IAzureBlobStorageService _azureBlobStorageService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;
    private readonly string _containerName;
    private readonly TenantDbContext _tenantDbContext;

    public UploadFileService(
        ILogger<UploadFileService> logger,
        AppDefaultConfig appDefaultConfig,
        IHttpClientFactory httpClientFactory,
        IAzureBlobStorageService azureBlobStorageService,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        TenantDbContext tenantDbContext)
    {
        _logger = logger;
        _appDefaultConfig = appDefaultConfig;
        _httpClientFactory = httpClientFactory;
        _azureBlobStorageService = azureBlobStorageService;

        // Set _userId and _tenantId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        bool isTenantless = httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-Scope"].FirstOrDefault()?.Equals("tenantless", StringComparison.OrdinalIgnoreCase) == true;

        _containerName = isTenantless ? "tenantless-files" : currentTenantService.CurrentTenantContainerName;
        _tenantDbContext = tenantDbContext;
    }

    public async Task<ServiceResponse<IEnumerable<FileUploadResponseDto>>> UploadFilesTemporaryAsync(List<IFormFile> files)
    {
        return await CoreUploadFilesAsync(files, _appDefaultConfig.FileUploadConfig.TempUploadDirectory);
    }

    // Uploads a single file and returns the result in a service response.
    public async Task<ServiceResponse<FileUploadResponseDto>> UploadSingleFileAsync(IFormFile file)
    {
        // Initialize the response to indicate failure by default
        var serviceResponse = new ServiceResponse<FileUploadResponseDto>
        {
            Data = null,
            Message = "File not uploaded."
        };

        // Check if the provided file is null
        if (file == null)
        {
            serviceResponse.Message = "No file provided for upload.";
            return serviceResponse;
        }

        // Attempt to upload the file(s) and get the response
        var response = await UploadFilesAsync([file]);

        // Update the service response based on the upload result
        serviceResponse.Message = response.Message;
        serviceResponse.StatusCode = response.StatusCode;
        serviceResponse.Data = response.Data?.FirstOrDefault();

        // Return the service response with the upload result
        return serviceResponse;
    }

    // Uploads multiple files for a given step and returns the saved file URLs.
    public async Task<ServiceResponse<IEnumerable<FileUploadResponseDto>>> UploadFilesAsync(List<IFormFile> files)
    {
        return await CoreUploadFilesAsync(files, _appDefaultConfig.FileUploadConfig.UploadDirectory);
    }

    private async Task<ServiceResponse<IEnumerable<FileUploadResponseDto>>> CoreUploadFilesAsync(List<IFormFile> files, string fileUploadDirectory)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FileUploadResponseDto>>
        {
            Data = null,
            Message = "Files not uploaded."
        };

        var uploadedFiles = new List<FileUploadResponseDto>();

        try
        {
            // Validate if files are provided
            if (files == null || files.Count <= 0)
            {
                serviceResponse.Message = "No files to upload. Please select a file.";
                _logger.LogError(serviceResponse.Message);
                return serviceResponse;
            }

            // Process each file for validation and prepare for upload
            // Process each file individually
            foreach (var file in files)
            {
                _logger.LogInformation("Processing file: {FileName}", file.FileName);

                var extension = Path.GetExtension(file.FileName).ToLower();

                // Determine file category (e.g., image, document) based on extension
                var fileCategory = GetFileCategory(extension);

                // Validate file type
                if (string.IsNullOrEmpty(fileCategory) || !ValidateFileType(extension, fileCategory))
                {
                    serviceResponse.Message = $"The file type of '{file.FileName}' is unsupported.";
                    _logger.LogWarning(serviceResponse.Message);
                    return serviceResponse;
                }

                // Validate the uploaded file size based on its determined category
                // (e.g., image, document, video) to enforce storage and security limits
                if (!ValidateFileSize(file.Length, fileCategory))
                {
                    serviceResponse.Message = $"The file '{file.FileName}' exceeds the allowed size limit.";
                    _logger.LogWarning(serviceResponse.Message);
                    return serviceResponse;
                }

                // File passed all validation checks
                _logger.LogInformation("File '{FileName}' passed validation.", file.FileName);

                // Generate a unique filename to avoid collisions and preserve the file type:
                // - Append a GUID to guarantee uniqueness
                // - Preserve the original file extension to maintain file type compatibility
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";

                // Upload the file stream directly to Azure Blob Storage without persisting it temporarily on the application server
                using var fileStream = file.OpenReadStream();
                var fileUrl = await _azureBlobStorageService.UploadFileAsync(
                    _containerName,
                    fileStream,
                    uniqueFileName,
                    file.ContentType
                );

                // Store metadata about the uploaded file for the response payload
                uploadedFiles.Add(new FileUploadResponseDto
                {
                    Path = uniqueFileName,
                    Extension = extension.TrimStart('.').ToUpper(),
                    Name = file.FileName,
                    Size = file.Length
                });

                // Log successful upload with reference to the stored blob
                _logger.LogInformation("File '{FileName}' uploaded successfully. Blob URL: {FileUrl}", file.FileName, fileUrl
                );
            }

            serviceResponse.Data = uploadedFiles;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Files uploaded successfully.";
            _logger.LogInformation(serviceResponse.Message);

        }
        catch (Exception ex)
        {
            // Catch any unexpected error during the file upload process
            _logger.LogError("An error occurred during file upload: {ErrorMessage}.", ex.Message);
        }

        return serviceResponse;
    }

    // Deletes a file from the server's storage based on the file URL.
    public async Task<ServiceResponse<bool>> DeleteFileAsync(string fileUrl, bool isTemp = false)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "File deletion failed."
        };

        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError("{Message}", serviceResponse.Message);
                return serviceResponse;
            }

            _logger.LogInformation("Initiating file deletion for URL: {FileUrl}", fileUrl);

            // Check if the file exists
            if (!await _azureBlobStorageService.FileExistsAsync(_containerName, fileUrl))
            {
                serviceResponse.Message = $"File does not exist at path '{fileUrl}'.";
                _logger.LogWarning("{Message}", serviceResponse.Message);
                return serviceResponse;
            }

            // Delete the file
            if (!await _azureBlobStorageService.DeleteFileAsync(_containerName, fileUrl))
            {
                serviceResponse.Message = $"File could not be deleted at path '{fileUrl}'.";
                _logger.LogWarning("{Message}", serviceResponse.Message);
                return serviceResponse;
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "File deleted successfully.";
            _logger.LogInformation("File successfully deleted from '{FileUrl}'.", fileUrl);
        }
        catch (Exception ex)
        {
            // Catch any unexpected exceptions during the file deletion process
            _logger.LogError(serviceResponse.Message, ex);
        }

        // Return the service response with the status of the operation
        return serviceResponse;
    }

    // Identifies the file category based on the file extension
    private string GetFileCategory(string extension)
    {
        _logger.LogInformation("Determining file category for extension: {Extension}.", extension);

        // Check Pictures category
        if (_appDefaultConfig.FileUploadConfig.AllowedFileTypes.Pictures.AllowedFileExtensions.Contains(extension))
        {
            _logger.LogInformation("File extension '{Extension}' matches category: Pictures.", extension);
            return "Pictures";
        }

        // Check Documents category
        if (_appDefaultConfig.FileUploadConfig.AllowedFileTypes.Documents.AllowedFileExtensions.Contains(extension))
        {
            _logger.LogInformation("File extension '{Extension}' matches category: Documents.", extension);
            return "Documents";
        }

        // Check Videos category
        if (_appDefaultConfig.FileUploadConfig.AllowedFileTypes.Videos.AllowedFileExtensions.Contains(extension))
        {
            _logger.LogInformation("File extension '{Extension}' matches category: Videos.", extension);
            return "Videos";
        }

        // If no category matches, log the failure and return empty
        _logger.LogInformation("No matching file category found for extension: {Extension}.", extension);
        return string.Empty;
    }

    // Validates if the file type is allowed for the given category
    private bool ValidateFileType(string extension, string fileCategory)
    {
        _logger.LogInformation("Validating file type for extension: {Extension} under category: {Category}.", extension, fileCategory);

        // Retrieve the allowed extensions for the given file category
        List<string> allowedExtensions = fileCategory.ToLower() switch
        {
            "pictures" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Pictures.AllowedFileExtensions,
            "documents" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Documents.AllowedFileExtensions,
            "videos" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Videos.AllowedFileExtensions,
            _ => new List<string>()
        };

        // Check if the given extension is part of the allowed extensions
        var isValid = allowedExtensions.Contains(extension);

        // Log the result of the validation
        if (isValid)
        {
            _logger.LogInformation("File type validation successful for extension: {Extension} under category: {Category}.", extension, fileCategory);
        }
        else
        {
            _logger.LogError("File type validation failed for extension: {Extension} under category: {Category}.", extension, fileCategory);
        }
        return isValid;
    }

    // Validates if the file size exceeds the allowed size for the category
    private bool ValidateFileSize(long fileSize, string fileCategory)
    {
        _logger.LogInformation("Validating file size for category: {Category}. File size: {FileSize} bytes.", fileCategory, fileSize);

        // Convert the file size from bytes to megabytes
        var fileSizeInMB = fileSize / (1024.0 * 1024.0);

        _logger.LogDebug("Converted file size to megabytes: {FileSizeMB} MB.", fileSizeInMB);

        // Retrieve the maximum allowed size (in MB) for the given file category
        int maxSizeMB = fileCategory switch
        {
            "Pictures" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Pictures.MaxSizeMB,
            "Documents" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Documents.MaxSizeMB,
            "Videos" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Videos.MaxSizeMB,
            _ => throw new InvalidOperationException($"Unsupported file category: {fileCategory}")
        };

        _logger.LogDebug("Maximum allowed file size for category '{Category}': {MaxSizeMB} MB.", fileCategory, maxSizeMB);

        // Check if the file size is within the allowed limit
        var isValid = fileSizeInMB <= maxSizeMB;

        // Log the result of the validation
        if (isValid)
        {
            _logger.LogInformation("File size validation successful for category: {Category}.", fileCategory);
        }
        else
        {
            _logger.LogError("File size validation failed for category: {Category}. Allowed: {MaxSizeMB} MB, Actual: {FileSizeMB} MB.",
                fileCategory, maxSizeMB, fileSizeInMB);

        }
        return isValid;
    }

    // Downloads a file based on the provided file URL.
    public async Task<ServiceResponse<FileStreamContentResponseDto>> DownloadFileAsync(string fileUrl, bool isTemp = false)
    {
        var serviceResponse = new ServiceResponse<FileStreamContentResponseDto>
        {
            Data = null,
            Message = "File download failed."
        };

        try
        {
            // Validate the input URL
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError("{Message}", serviceResponse.Message);
                return serviceResponse;
            }

            // Check if the file exists
            if (!await _azureBlobStorageService.FileExistsAsync(_containerName, fileUrl))
            {
                serviceResponse.Message = $"File does not exist at path '{fileUrl}'.";
                _logger.LogWarning("{Message}", serviceResponse.Message);
                return serviceResponse;
            }

            var fileResponse = await _azureBlobStorageService.DownloadFileAsync(_containerName, fileUrl);

            // Return success response
            serviceResponse.Data = fileResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "File ready for download.";
            _logger.LogInformation("File {FileName} is ready for download.", fileResponse.Name);

        }
        catch (Exception ex)
        {
            _logger.LogError("Error during file download: {ErrorMessage}.", ex.Message);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<string>> DownloadFileOnServerAsync(string fileUrl, bool isTemp = false)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "File download failed from remote server."
        };

        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl) || !Uri.IsWellFormedUriString(fileUrl, UriKind.Absolute))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError(serviceResponse.Message);
                return serviceResponse;
            }
            _logger.LogInformation("Starting file download process for file URL: {FileUrl}.", fileUrl);
            var client = _httpClientFactory.CreateClient();

            var response = await client.GetAsync(fileUrl, HttpCompletionOption.ResponseHeadersRead);

            if (!response.IsSuccessStatusCode)
            {
                serviceResponse.Message = "Failed to download file from the remote server.";
                _logger.LogError(serviceResponse.Message);
                return serviceResponse;
            }

            var fileUploadDirectory = isTemp ? _appDefaultConfig.FileUploadConfig.TempUploadDirectory : _appDefaultConfig.FileUploadConfig.UploadDirectory;

            // Construct the full directory path for the file upload
            var fullDirectoryPath = Path.Combine(fileUploadDirectory);

            // Create the directory if it doesn't exist
            if (!Directory.Exists(fullDirectoryPath))
            {
                Directory.CreateDirectory(fullDirectoryPath);
                _logger.LogInformation("Created directory: {DirectoryPath}.", fullDirectoryPath);
            }

            var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
            var fileName = Path.GetFileName(new Uri(fileUrl).AbsolutePath);

            // Generate a unique name for the uploaded file
            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName).ToLower()}";

            var filePath = Path.Combine(fullDirectoryPath, uniqueFileName);

            var stream = await response.Content.ReadAsStreamAsync();

            // Save the file to the disk
            using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);

            await stream.CopyToAsync(fileStream);

            serviceResponse.Message = "File added successfully.";
            serviceResponse.StatusCode = 200;
            return serviceResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error during file download from remote server: {ErrorMessage}.", ex.Message);
        }

        return serviceResponse;
    }
    /// <summary>
    /// Uploads a file to Azure Blob Storage associated with a specific tenant.
    /// </summary>
    /// <param name="fileUrl">The URL of the file to be uploaded. Typically a local file path or temporary file path.</param>
    /// <param name="tenantId">The ID of the tenant associated with the file upload, used to determine the correct container name.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{string}"/> 
    /// with the status of the upload operation. If successful, it includes the unique file name used in Blob Storage. Otherwise, it returns an error message.</returns>
    public async Task<ServiceResponse<string>> UploadFileToBlobAsync(string fileUrl, Guid tenantId)
    {
        // Initialize the service response
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to upload file to Azure Blob Storage."
        };

        try
        {
            // Check if the file URL is provided
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError("File URL is null or empty.");
                return serviceResponse;
            }

            // Extract path segments from the file URL
            var pathSegments = fileUrl.TrimStart('/').Split('/');
            if (pathSegments.Length < 2)
            {
                serviceResponse.Message = "Invalid file URL structure. Expected format: '/subdirectory/filename.ext'.";
                _logger.LogWarning("Invalid URL structure. Provided URL: {FileUrl}", fileUrl);
                return serviceResponse;
            }

            // Extract file name and subdirectory from URL path segments
            var fileName = pathSegments.Last(); // The actual file name (e.g., file.ext)
            var subDirectory = pathSegments[^2]; // The subdirectory (one level before the file name)

            // Construct the full local file path
            var fullLocalPath = Path.Combine("/var/www/aventisia.com/files", subDirectory, fileName);

            // Log the expected local file path
            _logger.LogInformation("Constructed local file path: {FullLocalPath}", fullLocalPath);

            // Ensure the file exists locally
            if (!File.Exists(fullLocalPath))
            {
                serviceResponse.Message = $"File does not exist at path: {fullLocalPath}";
                _logger.LogWarning("File does not exist at path: {FullLocalPath}", fullLocalPath);
                return serviceResponse;
            }

            // Get the file extension and convert it to lowercase
            var extension = Path.GetExtension(fileName).ToLower();

            // Determine MIME type based on file extension
            string mimeType = extension switch
            {
                // Document types
                ".pdf" => "application/pdf",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".txt" => "text/plain",

                // Image types
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",

                // Audio types
                ".mp3" => "audio/mpeg",
                ".wav" => "audio/wav",
                ".aac" => "audio/aac",
                ".ogg" => "audio/ogg",
                ".oga" => "audio/ogg",
                ".flac" => "audio/flac",
                ".m4a" => "audio/m4a",
                ".opus" => "audio/opus",

                // Default MIME type
                _ => "application/octet-stream"
            };

            // Log the determined MIME type
            _logger.LogInformation("Determined MIME type for file {FileName}: {MimeType}", fileName, mimeType);

            // Create a unique filename to prevent conflicts, keeping the file extension.
            var uniqueFileName = fileName;

            // Log the unique file name generated
            _logger.LogInformation("Generated unique file name for upload: {UniqueFileName}", uniqueFileName);

            // Retrieve tenant information based on tenantId
            var tenant = await _tenantDbContext.ReadOnlyTenants.SingleOrDefaultAsync(w => w.Id == tenantId);
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant not found.";
                _logger.LogWarning("Tenant with ID {TenantId} not found.", tenantId);
                return serviceResponse;
            }

            // Determine the container name for the tenant
            var containerName = tenant.ContainerName;

            // Upload the file asynchronously to Azure Blob Storage
            _logger.LogInformation("Starting file upload for {FileName} to Azure Blob Storage in container {ContainerName}.", fileName, containerName);

            // Open the file stream and upload the file to Blob Storage
            using (var fileStream = File.OpenRead(fullLocalPath))
            {
                // Assuming _azureBlobStorageService.UploadFileAsync returns a URI or other result
                var blobUri = await _azureBlobStorageService.UploadFileAsync(
                    containerName,
                    fileStream,
                    uniqueFileName,
                    mimeType
                );

                // Log successful upload
                _logger.LogInformation("Successfully uploaded file {FileName} to Azure Blob Storage. Blob URI: {BlobUri}", fileName, blobUri?.ToString());

                // Store the unique file name in the service response as an indicator of success
                serviceResponse.Data = uniqueFileName;
            }

            // Update the service response to indicate success
            serviceResponse.Message = "File uploaded successfully to Azure Blob Storage.";
            serviceResponse.StatusCode = 200;

        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the upload process
            _logger.LogError(ex, "An error occurred while uploading the file to Azure Blob Storage.");
        }

        // Return the service response with status and file details
        return serviceResponse;
    }
}
