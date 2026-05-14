namespace MLModelBuilderAPIs.Services;

public class VersionResourceService : IVersionResourceService
{
    #region Fields
    private readonly ILogger<VersionResourceService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IAzureBlobStorageService _azureBlobStorageService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;
    private readonly string _containerName;
    private readonly IUploadFileService _uploadFileService;

    #endregion
    public VersionResourceService(
        ILogger<VersionResourceService> logger,
        AppDefaultConfig appDefaultConfig,
        EnvironmentConfig environmentConfig,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IAzureBlobStorageService azureBlobStorageService,
        ICurrentTenantService currentTenantService,
        IUploadFileService uploadFileService)
    {
        // Set _userId and _tenantId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _appDefaultConfig = appDefaultConfig;
        _environmentConfig = environmentConfig;
        _unitOfWork = unitOfWork;
        _azureBlobStorageService = azureBlobStorageService;
        _containerName = currentTenantService.CurrentTenantContainerName;
        _uploadFileService = uploadFileService;
    }


    // Inserts multiple version resources records into the database.
    public async Task<ServiceResponse<List<VersionResourceDto>>> InsertVersionResourcesAsync(List<VersionResourceDto> uploadedDocList)
    {
        // Initialize the service response with default failure state
        var serviceResponse = new ServiceResponse<List<VersionResourceDto>>
        {
            Data = null,
            Message = "Failed to insert version resources. Please try again."
        };

        try
        {
            var versionResourceEntities = new List<VersionResource>();

            // Map each DTO to the entity and set audit info
            foreach (var docDto in uploadedDocList)
            {
                var versionResourceEntity = docDto.Adapt<VersionResource>();

                versionResourceEntity.CreatedByUserId = _userId;
                versionResourceEntity.LastModifiedByUserId = _userId;

                versionResourceEntities.Add(versionResourceEntity);
            }

            // Insert the batch of new documents into the repository
            await _unitOfWork.VersionResourceRepo.InsertAsync(versionResourceEntities);

            // Commit changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("SaveChanges failed while inserting uploaded documents.");
                return serviceResponse;
            }

            // Successfully inserted - map entities back to DTOs for the response
            serviceResponse.Data = versionResourceEntities.Adapt<List<VersionResourceDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version resources added successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting uploaded documents.");
        }

        return serviceResponse;
    }

    // Processes and saves version resource for a batch of uploaded data files.
    public async Task<ServiceResponse<List<VersionResourceDto>>> UploadVersionResourceFilesAsync(UploadVersionResourceDto uploadVersionResourceDto)
    {
        // Initialize the response with a default failure state
        var serviceResponse = new ServiceResponse<List<VersionResourceDto>>
        {
            Data = null,
            Message = "Failed to upload version resource files. Please try again."
        };

        try
        {
            var versionResources = new List<VersionResource>();

            // Process each uploaded file individually
            foreach (var formFile in uploadVersionResourceDto.Files)
            {
                // Upload the current file and get the result
                var uploadResult = await UploadFilesAsync(new List<IFormFile> { formFile }, uploadVersionResourceDto.Purpose);

                // Validate upload result
                if (uploadResult.Data == null || !uploadResult.Data.Any())
                {
                    _logger.LogWarning("File upload failed or returned no result for file: {FileName}, AI Project Version ID: {ProjectVersionId}",
                        formFile.FileName, uploadVersionResourceDto.AIProjectVersionId);

                    serviceResponse.Message = $"File upload failed for AI Project Version ID: {uploadVersionResourceDto.AIProjectVersionId}";
                    return serviceResponse;
                }

                // Map common metadata from the DTO to a new VersionResource entity
                var versionResourceEntity = uploadVersionResourceDto.Adapt<VersionResource>();

                // Map the uploaded file details onto the entity (e.g., Path, Name, Size)
                uploadResult.Data.First().Adapt(versionResourceEntity);

                // Assign auditing information
                versionResourceEntity.CreatedByUserId = _userId;
                versionResourceEntity.LastModifiedByUserId = _userId;

                versionResources.Add(versionResourceEntity);
            }

            // Insert all new VersionResource entities in a batch
            await _unitOfWork.VersionResourceRepo.InsertAsync(versionResources);

            // Persist changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save uploaded document records to the database.");
                return serviceResponse;
            }

            // Map saved entities to DTOs for returning to the client
            serviceResponse.Data = versionResources.Adapt<List<VersionResourceDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version resouces uploaded successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while uploading documents for AI Project Version ID: {ProjectVersionId}", uploadVersionResourceDto.AIProjectVersionId);
        }

        return serviceResponse;
    }

    // Retrieves a list of version resources associated with the specified AI projecr version ID and data type.
    public async Task<ServiceResponse<IEnumerable<VersionResourceDto>>> GetVersionResourcesAsync(Guid aiProjectVersionId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<VersionResourceDto>>
        {
            Data = null,
            Message = "Failed to retrieve verison resources. Please try again."
        };

        try
        {
            // Fetch documents associated with the ai projecct version, including creator user info,
            // ordered by creation date descending
            var versionResources = await _unitOfWork.VersionResourceRepo
                .GetByConditionAsync(w => w.AIProjectVersionId == aiProjectVersionId)
                .Include(c => c.CreatedByUser)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Map domain entities to DTOs
            var dtoList = versionResources.Adapt<IEnumerable<VersionResourceDto>>();

            // Successful retrieval, update response accordingly
            serviceResponse.Data = dtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version resources retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log full exception details for troubleshooting
            _logger.LogError(ex, "An error occurred while retrieving uploaded documents for AI project version ID: {MlModelId}", aiProjectVersionId);
        }

        return serviceResponse;
    }

    // Deletes a specific uploaded version resource (document and its associated file).
    public async Task<ServiceResponse<bool>> DeleteVersionResourceAsync(Guid versionResourceId)
    {
        // Initialize default failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete version resource. Please try again."
        };

        try
        {
            // Retrieve the version resource ensuring it belongs to the current user
            var versionResource = await _unitOfWork.VersionResourceRepo
                .GetByConditionAsync(vr => vr.Id == versionResourceId && vr.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the version resource does not exist or doesn't belong to the user, return 404
            if (versionResource == null)
            {
                _logger.LogInformation("Version resource not found or access denied. version resources ID: {VersionResourceId}, User ID: {UserId}", versionResourceId, _userId);

                serviceResponse.StatusCode = 404;
                serviceResponse.Message = "Uploaded version resource does not exist or you do not have permission to delete it.";
                return serviceResponse;
            }

            // Extract file URL for later deletion
            var fileUrl = versionResource.Path;

            // Delete record from ExtractedData entities associated with this version resource
            var extractedDataRecords = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.VersionResourceId == versionResourceId)
                .ToListAsync();

            if (extractedDataRecords.Any())
            {
                _unitOfWork.ExtractedDataRepo.Delete(extractedDataRecords);
                _logger.LogInformation("Deleted {Count} associated ExtractedData records for version resource ID: {VersionResourceId}", extractedDataRecords.Count, versionResourceId);
            }

            // Delete the version resource record from the database
            _unitOfWork.VersionResourceRepo.Delete(versionResource);

            // Save the changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes to DB for version resource ID: {VersionResourceIds}", versionResourceId);
                return serviceResponse;
            }

            _logger.LogInformation("Database record deleted for version resource ID: {VersionResourceIds}", versionResourceId);

            // Attempt to delete the associated file from the file system
            if (!string.IsNullOrWhiteSpace(fileUrl))
            {
                _logger.LogInformation("Attempting to delete file at path: {FileUrl}", fileUrl);

                var isFileDeleted = await _azureBlobStorageService.DeleteFileAsync(_containerName, fileUrl);
                if (!isFileDeleted)
                {
                    _logger.LogWarning("Failed to delete file at path: {FileUrl}", fileUrl);
                }
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version resource deleted successfully.";

            _logger.LogInformation("Successfully deleted version resource and file for version resource ID: {VersionResourceId}", versionResourceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting version resource with ID: {VersionResourceId}", versionResourceId);
        }

        return serviceResponse;
    }

    // Deletes multiple uploaded version resources (documents and files) based on their IDs.
    public async Task<ServiceResponse<bool>> DeleteVersionResourcesAsync(List<Guid> versionResourceIds)
    {
        // Step 0: Initialize default failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 500,
            Message = "Failed to delete uploaded documents. Please try again."
        };

        try
        {
            // Retrieve version resources matching the provided IDs
            var versionResourcesToDelete = await _unitOfWork.VersionResourceRepo
                .GetByConditionAsync(vr => versionResourceIds.Contains(vr.Id))
                .ToListAsync();

            // Handle case where no matching documents are found
            if (!versionResourcesToDelete.Any())
            {
                _logger.LogInformation("No version resources found for the provided IDs: {VersionResourceIds}. Deletion skipped.",
                    string.Join(", ", versionResourceIds));

                serviceResponse.StatusCode = 404;
                serviceResponse.Message = "No version resources found with the specified IDs.";
                return serviceResponse;
            }

            _logger.LogInformation("Found {Count} version resource(s) to delete. Proceeding with deletion.", versionResourcesToDelete.Count);

            // Extract file URLs for file system deletion
            var fileUrls = versionResourcesToDelete
                .Where(vr => !string.IsNullOrWhiteSpace(vr.Path))
                .Select(vr => vr.Path)
                .ToList();

            // Delete records from the database
            _unitOfWork.VersionResourceRepo.Delete(versionResourcesToDelete);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist deletion of version resource records to the database.");
                return serviceResponse;
            }

            _logger.LogInformation("Successfully deleted {Count} version resource record(s) from the database.", versionResourcesToDelete.Count);

            // Delete corresponding files from file system
            foreach (var fileUrl in fileUrls)
            {
                _logger.LogInformation("Attempting to delete file from file system: {FileUrl}", fileUrl);

                var isFileDeleted = DeleteFileByURL(fileUrl);
                if (!isFileDeleted)
                {
                    _logger.LogWarning("File not found or deletion failed at: {FileUrl}", fileUrl);
                }
            }

            // Finalize success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{versionResourcesToDelete.Count} version resource(s) deleted successfully.";

            _logger.LogInformation("Deletion process completed for document IDs: {VersionResourceIds}", string.Join(", ", versionResourceIds));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting uploaded version resources.");
        }

        return serviceResponse;
    }

    // Deletes all uploaded version resources (version resources and files) associated with a specific AI project version.
    public async Task<ServiceResponse<bool>> DeleteVersionResourceByAIProjectVersionAsync(Guid aiProjectVersionId)
    {
        // Initialize the response as failed by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete version resources. Please try again."
        };

        try
        {
            // Fetch all version resources associated with the given AI project version
            var versionResources = await _unitOfWork.VersionResourceRepo
                .GetByConditionAsync(vr => vr.AIProjectVersionId == aiProjectVersionId)
                .ToListAsync();

            // Return early if no documents found
            if (!versionResources.Any())
            {
                _logger.LogInformation("No version resources found for AI project version ID: {AIProjectVersionId}. Deletion skipped.", aiProjectVersionId);

                serviceResponse.StatusCode = 404;
                serviceResponse.Message = "No version resources found for the specified AI project version.";
                return serviceResponse;
            }

            _logger.LogInformation("Found {Count} version resource(s) for AI project version ID: {AIProjectVersionId}. Starting deletion process.",
                versionResources.Count, aiProjectVersionId);

            // Extract file paths from the version resources
            var fileUrls = versionResources.Select(vr => vr.Path).ToList();

            // Delete records from the database
            _unitOfWork.VersionResourceRepo.Delete(versionResources);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist database changes after deleting version resource records for AI project version ID: {AIProjectVersionId}", aiProjectVersionId);
                return serviceResponse;
            }

            // Delete associated physical files
            foreach (var fileUrl in fileUrls)
            {
                if (!string.IsNullOrWhiteSpace(fileUrl))
                {
                    _logger.LogInformation("Attempting to delete file from file system: {FileUrl}", fileUrl);

                    var isFileDeleted = await _azureBlobStorageService.DeleteFileAsync(_containerName, fileUrl);
                    if (!isFileDeleted)
                    {
                        _logger.LogWarning("File deletion failed or file not found at: {FileUrl}", fileUrl);
                    }
                }
            }

            // Update response and log success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{versionResources.Count} version resource(s) successfully deleted.";

            _logger.LogInformation("Successfully deleted {Count} version resource(s) and associated files for AI project version ID: {AIProjectVersionId}",
                versionResources.Count, aiProjectVersionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting version resources for AI project version ID: {AIProjectVersionId}", aiProjectVersionId);
        }

        return serviceResponse;
    }

    // Uploads multiple files for a given purpose, validates, stores, and returns saved file details.
    public async Task<ServiceResponse<IEnumerable<FileDetailDto>>> UploadFilesAsync(List<IFormFile> files, DocumentPurposeTypesEnum purpose)
    {
        // Initialize service response with failure by default
        var serviceResponse = new ServiceResponse<IEnumerable<FileDetailDto>>
        {
            Data = null,
            Message = "Failed to upload files. Please try again."
        };

        var uploadedFiles = new List<FileDetailDto>();

        try
        {
            // Check if any files were provided
            if (files == null || !files.Any())
            {
                serviceResponse.Message = "No files to upload. Please select at least one file.";
                _logger.LogWarning(serviceResponse.Message);
                return serviceResponse;
            }

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
                uploadedFiles.Add(new FileDetailDto
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
            // Successfully uploaded all files
            serviceResponse.Data = uploadedFiles;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Files uploaded successfully.";
            _logger.LogInformation(serviceResponse.Message);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors
            _logger.LogError(ex, "An error occurred during file upload.");
        }

        return serviceResponse;
    }

    // Downloads a file based on the provided file URL.
    public async Task<ServiceResponse<FileStreamContentResponseDto>> DownloadFileAsync(string fileUrl)
    {
        // Initialize the response with failure by default
        var serviceResponse = new ServiceResponse<FileStreamContentResponseDto>
        {
            Data = null,
            Message = "Failed to download file. Please try again."
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
            _logger.LogError(ex, "Exception occurred while processing file download.");
        }

        return serviceResponse;
    }

    // Deletes a file from the server's storage based on the file URL.
    public async Task<ServiceResponse<bool>> DeleteFileAsync(string fileUrl)
    {
        // Initialize the response with default failure
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed tp delete by url. Please try again."
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
            _logger.LogError(ex, "An error occurred while deleting the file.");
        }

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

        // Check Audios category
        if (_appDefaultConfig.FileUploadConfig.AllowedFileTypes.Audio.AllowedFileExtensions.Contains(extension))
        {
            _logger.LogInformation("File extension '{Extension}' matches category: Audio.", extension);
            return "Audio";
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
            "audio" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Audio.AllowedFileExtensions,
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
        int maxSizeMB = fileCategory.ToLower() switch
        {
            "pictures" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Pictures.MaxSizeMB,
            "documents" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Documents.MaxSizeMB,
            "videos" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Videos.MaxSizeMB,
            "audio" => _appDefaultConfig.FileUploadConfig.AllowedFileTypes.Audio.MaxSizeMB,
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

    // Attempts to delete a file from the specified URL.
    private bool DeleteFileByURL(string url)
    {
        try
        {
            // Validate input URL
            if (string.IsNullOrWhiteSpace(url))
            {
                _logger.LogWarning("DeleteFileByURL: Provided file URL is null or empty. File deletion skipped.");
                return false;
            }

            // Split the URL into segments to extract subdirectory and filename
            var trimmedUrl = url.Trim('/');
            var urlSegments = trimmedUrl.Split('/');

            // Ensure the URL has at least two parts: [subdirectory]/[filename]
            if (urlSegments.Length < 2)
            {
                _logger.LogWarning("DeleteFileByURL: URL format is invalid. Expected at least subdirectory and filename. URL: {Url}", url);
                return false;
            }

            // Extract subdirectory and filename from URL
            string subdirectoryName = urlSegments[^2]; // Second-to-last part
            string fileName = urlSegments[^1];         // Last part

            _logger.LogDebug("DeleteFileByURL: Extracted subdirectory '{Subdirectory}' and file name '{FileName}' from URL: {Url}", subdirectoryName, fileName, url);

            // Construct the absolute file path
            string fullFilePath = Path.Combine(_appDefaultConfig.FileUploadConfig.UploadDirectory, subdirectoryName, fileName);

            _logger.LogDebug("DeleteFileByURL: Resolved file path: {FullPath}", fullFilePath);

            // Check if the file exists at the resolved path
            if (File.Exists(fullFilePath))
            {
                _logger.LogInformation("DeleteFileByURL: File exists. Initiating deletion at path: {FilePath}", fullFilePath);

                // Attempt to delete the file
                File.Delete(fullFilePath);

                _logger.LogInformation("DeleteFileByURL: File successfully deleted from path: {FilePath}", fullFilePath);
                return true;
            }
            else
            {
                _logger.LogWarning("DeleteFileByURL: File not found at path: {FilePath}. Deletion not performed.", fullFilePath);
                return false;
            }
        }
        catch (Exception ex)
        {
            // Log the exception with context
            _logger.LogError(ex, "DeleteFileByURL: An unexpected error occurred while attempting to delete the file. URL: {Url}", url);
            return false;
        }
    }

    // Helper: Convert file to pdf using llmpipeline api
    public async Task<FileDetailDto?> ConvertFileToPDF(string filePath)
    {
        try
        {
            // Remove leading "/files" if present. TODO: This /files/ seems unnecessary in the local file path when we upload a file. need to check and change the logic
            if (filePath.StartsWith("/files/"))
                filePath = filePath.Substring("/files/".Length);

            // Combine with local storage path
            filePath = Path.Combine(_appDefaultConfig.FileUploadConfig.UploadDirectory, filePath.TrimStart('/'));

            using (HttpClient client = new HttpClient())
            {
                // TODO: Currently there is no API_KEY based authentication mechanism in llmpipeline api
                // client.DefaultRequestHeaders.Add("API_KEY", _environmentConfig.LLMPipelineAPIKey);

                var requestDto = new
                {
                    file = filePath
                };

                var jsonRequest = System.Text.Json.JsonSerializer.Serialize(requestDto);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _logger.LogInformation("Requesting file conversion to PDF for file path: {filePath}", filePath);
                HttpResponseMessage response = await client.PostAsync($"{_environmentConfig.LlmPipelineApiBaseUrl}/api/convert-to-pdf", content);

                // If the response is unsuccessful, log the error and return null
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to convert file to PDF. StatusCode: {statusCode}, FilePath: {filePath}", response.StatusCode, filePath);
                    return null;
                }

                var fileDetailDto = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Successfully converted file to PDF for file: {fileDetailDto}", fileDetailDto);
                return JsonSerializer.Deserialize<FileDetailDto>(fileDetailDto, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("An error occurred while converting file to PDF: {error}", ex.Message);
            return null;
        }
    }

    // Upload a file from the local system to the cloud
    public async Task<ServiceResponse<bool>> UploadFileLocalToCloudAsync()
    {
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to upload file."
        };

        try
        {
            // Get the list of files where the Path is not null, not empty, and starts with "/"
            var files = await _unitOfWork.VersionResourceRepo
                .GetByConditionAsync(w => !string.IsNullOrEmpty(w.Path) && w.Path.StartsWith("/"))
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation($"Found {files.Count} file(s) to upload.");

            var needToUpdates = new List<VersionResource>();

            // Iterate through files and attempt to upload each
            foreach (var file in files)
            {
                var response = await _uploadFileService.UploadFileToBlobAsync(file.Path, file.TenantId);

                if (response.StatusCode == 200)
                {
                    file.Path = response.Data ?? string.Empty;
                    needToUpdates.Add(file);
                }
                else
                {
                    // Handle non-200 status codes here (e.g., logging or retrying)
                    _logger.LogWarning($"Failed to upload file: {file.Path}, Status Code: {response.StatusCode}");
                }
            }

            // If we have files that need to be updated, persist changes
            if (needToUpdates.Any())
            {
                _unitOfWork.VersionResourceRepo.Update(needToUpdates);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save changes to the database after upload.");
                    return serviceResponse;
                }
            }

            serviceResponse.Data = true;
            serviceResponse.Message = "Files uploaded successfully.";
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            // Log exception details for debugging
            _logger.LogError($"An error occurred during the upload process: {ex.Message}", ex);
            serviceResponse.Message = $"An error occurred: {ex.Message}";
        }

        return serviceResponse;
    }
}