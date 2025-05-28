namespace AspNetToolkit.Services;

public class UploadFileService : IUploadFileService
{
    private readonly ILogger<UploadFileService> _logger;
    private readonly FileUploadConfig _fileUploadConfig;

    private readonly IHttpClientFactory _httpClientFactory;

    public UploadFileService(ILogger<UploadFileService> logger, FileUploadConfig fileUploadConfig, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _fileUploadConfig = fileUploadConfig;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<ServiceResponse<IEnumerable<FileUploadResponseDto>>> UploadFilesTemporaryAsync(List<IFormFile> files)
    {
        return await CoreUploadFilesAsync(files, _fileUploadConfig.TempUploadDirectory);
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
        return await CoreUploadFilesAsync(files, _fileUploadConfig.UploadDirectory);
    }

    private async Task<ServiceResponse<IEnumerable<FileUploadResponseDto>>> CoreUploadFilesAsync(List<IFormFile> files, string fileUploadDirectory)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FileUploadResponseDto>>
        {
            Data = null,
            Message = "Files not uploaded."
        };

        var fileStreams = new List<(string FileName, MemoryStream Stream)>();

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
            foreach (var file in files)
            {
                _logger.LogInformation("Processing file: {FileName}.", file.FileName);
                var extension = Path.GetExtension(file.FileName).ToLower();

                // Identify file category based on the extension
                var fileCategory = GetFileCategory(extension);

                // Validate file type
                if (string.IsNullOrEmpty(fileCategory) || !ValidateFileType(extension, fileCategory))
                {
                    serviceResponse.Message = $"The type of file {file.FileName} is unsupported.";
                    _logger.LogError(serviceResponse.Message);
                    return serviceResponse;
                }

                // Validate file size
                if (!ValidateFileSize(file.Length, fileCategory))
                {
                    serviceResponse.Message = $"The file {file.FileName} exceeds the allowed size limit.";
                    _logger.LogError(serviceResponse.Message);
                    return serviceResponse;
                }

                _logger.LogInformation("File {FileName} passed validation.", file.FileName);

                // Prepare file for storage by reading into a memory stream
                var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                fileStreams.Add((file.FileName, memoryStream));
            }

            // Write files to storage after validation
            var uploadedFiles = await WriteFilesToStorage(fileStreams, fileUploadDirectory);

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
        finally
        {
            // Dispose of all file streams to release memory
            foreach (var (_, stream) in fileStreams)
            {
                stream.Dispose();
            }

            // Log completion of file storage operation
            _logger.LogInformation("Completed writing files to storage.");
        }

        return serviceResponse;
    }

    // Deletes a file from the server's storage based on the file URL.
    public ServiceResponse<bool> DeleteFileAsync(string fileUrl, bool isTemp = false)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "File deletion failed."
        };

        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError(serviceResponse.Message);
                return serviceResponse;
            }

            _logger.LogInformation("Starting file deletion process for file URL: {FileUrl}.", fileUrl);

            // Remove the leading '/' from the fileUrl if present and split the path by '/'
            var pathParts = fileUrl.TrimStart('/').Split('/');

            // Ensure the URL has at least 2 parts: 'files', the subdirectory, and the file name
            if (pathParts.Length < 2)
            {
                serviceResponse.Message = "Invalid file URL structure.";
                _logger.LogError("Invalid file URL structure. Expected format: '/files/{filename}'.", pathParts.Last());
                return serviceResponse;
            }

            var fileName = pathParts.Last();  // The file name is the last part, e.g., "2290a6c2-74d4-4f37-8bac-e1befb2242ce.pdf"

            // Construct the full file path using the base upload directory, subdirectory, and file name
            var fullDirectoryPath = Path.Combine(isTemp ? _fileUploadConfig.TempUploadDirectory : _fileUploadConfig.UploadDirectory);

            var filePath = Path.Combine(fullDirectoryPath, fileName);

            _logger.LogInformation("Resolved file path: {FilePath}.", filePath);

            // Check if the file exists at the resolved path
            if (File.Exists(filePath))
            {
                _logger.LogInformation("File {FileName} exists at {FilePath}, proceeding with deletion.", fileName, filePath);

                // Attempt to delete the file
                File.Delete(filePath);

                // Update the response to indicate success
                serviceResponse.StatusCode = 200;
                serviceResponse.Data = true;
                serviceResponse.Message = "File deleted successfully.";
                _logger.LogInformation("File {FileName} deleted from {FilePath}.", fileName, filePath);
            }
            else
            {
                // If the file doesn't exist, log the warning
                serviceResponse.Message = $"File {fileName} does not exist";
                _logger.LogWarning($"File {fileName} does not exist at {filePath}.");
            }

        }
        catch (Exception ex)
        {
            // Catch any unexpected exceptions during the file deletion process
            _logger.LogError(serviceResponse.Message, ex);
        }

        // Return the service response with the status of the operation
        return serviceResponse;
    }

    private async Task<List<FileUploadResponseDto>> WriteFilesToStorage(List<(string FileName, MemoryStream Stream)> fileStreams, string fileUploadDirectory)
    {

        var uploadedFiles = new List<FileUploadResponseDto>();

        foreach (var (fileName, stream) in fileStreams)
        {
            _logger.LogInformation("Uploading file: {FileName}.", fileName);

            try
            {
                // Construct the full directory path for the file upload
                var fullDirectoryPath = Path.Combine(fileUploadDirectory);

                // Create the directory if it doesn't exist
                if (!Directory.Exists(fullDirectoryPath))
                {
                    Directory.CreateDirectory(fullDirectoryPath);
                    _logger.LogInformation("Created directory: {DirectoryPath}.", fullDirectoryPath);
                }

                // Generate a unique name for the uploaded file
                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName).ToLower()}";

                var filePath = Path.Combine(fullDirectoryPath, uniqueFileName);

                stream.Position = 0;

                // Save the file to the disk
                using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                {
                    await stream.CopyToAsync(fileStream);
                }

                // Construct the file URL for referencing later
                var fileUrl = $"/files/{uniqueFileName}".Replace("\\", "/");

                uploadedFiles.Add(new()
                {
                    Path = fileUrl,
                    Extension = Path.GetExtension(fileName).TrimStart('.').ToUpper(),
                    Name = fileName,
                    Size = stream.Length,
                });

                _logger.LogInformation("File uploaded successfully: {FileName}, Path: {FilePath}.", fileName, filePath);
            }
            catch (Exception ex)
            {
                // Log any error that occurs during file writing
                _logger.LogError("Error uploading file '{FileName}': {ErrorMessage}.", fileName, ex.Message);
            }
        }
        return uploadedFiles;
    }

    // Identifies the file category based on the file extension
    private string GetFileCategory(string extension)
    {
        _logger.LogInformation("Determining file category for extension: {Extension}.", extension);

        // Check Pictures category
        if (_fileUploadConfig.AllowedFileTypes.Pictures.AllowedFileExtensions.Contains(extension))
        {
            _logger.LogInformation("File extension '{Extension}' matches category: Pictures.", extension);
            return "Pictures";
        }

        // Check Documents category
        if (_fileUploadConfig.AllowedFileTypes.Documents.AllowedFileExtensions.Contains(extension))
        {
            _logger.LogInformation("File extension '{Extension}' matches category: Documents.", extension);
            return "Documents";
        }

        // Check Videos category
        if (_fileUploadConfig.AllowedFileTypes.Videos.AllowedFileExtensions.Contains(extension))
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
            "pictures" => _fileUploadConfig.AllowedFileTypes.Pictures.AllowedFileExtensions,
            "documents" => _fileUploadConfig.AllowedFileTypes.Documents.AllowedFileExtensions,
            "videos" => _fileUploadConfig.AllowedFileTypes.Videos.AllowedFileExtensions,
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
            "Pictures" => _fileUploadConfig.AllowedFileTypes.Pictures.MaxSizeMB,
            "Documents" => _fileUploadConfig.AllowedFileTypes.Documents.MaxSizeMB,
            "Videos" => _fileUploadConfig.AllowedFileTypes.Videos.MaxSizeMB,
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
    public ServiceResponse<FileUploadResponseDto> DownloadFileAsync(string fileUrl, bool isTemp = false)
    {
        var serviceResponse = new ServiceResponse<FileUploadResponseDto>
        {
            Data = null,
            Message = "File download failed."
        };

        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError(serviceResponse.Message);
                return serviceResponse;
            }

            _logger.LogInformation("Starting file download process for file URL: {FileUrl}.", fileUrl);

            // Split file URL to extract subdirectory and file name
            var pathParts = fileUrl.TrimStart('/').Split('/');

            if (pathParts.Length < 2)
            {
                serviceResponse.Message = "Invalid file URL structure.";
                _logger.LogError("Invalid file URL structure. Expected format: '/files/{filename}'.", pathParts.Last());
                return serviceResponse;

            }

            var fileName = pathParts.Last();

            var filePath = Path.Combine(isTemp ? _fileUploadConfig.TempUploadDirectory : _fileUploadConfig.UploadDirectory, fileName);

            if (File.Exists(filePath))
            {

                _logger.LogInformation("File {FileName} exists at {FilePath}, proceeding with download.", fileName, filePath);

                // Prepare the file details for response
                var fileDetail = new FileUploadResponseDto
                {
                    Path = filePath,
                    Extension = Path.GetExtension(fileName).TrimStart('.').ToUpper(),
                    Name = fileName,
                    Size = new FileInfo(filePath).Length,
                };

                serviceResponse.Data = fileDetail;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "File ready for download.";
                _logger.LogInformation("File {FileName} is ready for download.", fileName);
            }
            else
            {
                serviceResponse.Message = $"File does not exist.";
                _logger.LogWarning($"File {fileName} does not exist at {filePath}.");
            }
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

            var fileUploadDirectory = isTemp ? _fileUploadConfig.TempUploadDirectory : _fileUploadConfig.UploadDirectory;

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

}
