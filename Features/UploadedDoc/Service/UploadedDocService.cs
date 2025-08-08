namespace MLModelBuilderAPIs.Services;

public class UploadedDocService : IUploadedDocService
{
    #region Fields
    private readonly ILogger<UploadedDocService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly FileUploadConfig _fileUploadConfig;
    private readonly IWebHostEnvironment _webHostEnvironment;

    #endregion
    public UploadedDocService(
        ILogger<UploadedDocService> logger,
        FileUploadConfig fileUploadConfig,
        IWebHostEnvironment webHostEnvironment,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _fileUploadConfig = fileUploadConfig;
        _webHostEnvironment = webHostEnvironment;
        _unitOfWork = unitOfWork;

    }

    // Uploads multiple files for a given step and returns the saved file URLs.
    public async Task<ServiceResponse<IEnumerable<FileDetailDto>>> UploadFilesAsync(List<IFormFile> files, DocumentPurposeTypesEnum purpose)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FileDetailDto>>
        {
            Data = null,
            Message = "Files not uploaded."
        };

        var uploadedFiles = new List<FileDetailDto>();
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
            await WriteFilesToStorage(fileStreams, uploadedFiles, purpose);

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

    //Inserts an uploaded doc record
    public async Task<ServiceResponse<IList<UploadedDocDto>>> InsertUploadedDocAsync(IList<UploadedDocDto> uploadedDocList)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IList<UploadedDocDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            var docList = new List<UploadedDoc>();

            foreach (var doc in uploadedDocList)
            {
                // Default mapping
                var newDoc = doc.Adapt<UploadedDoc>();
                newDoc.CreatedByUserId = _userId;
                newDoc.LastModifiedByUserId = _userId;

                //Add doc to list
                docList.Add(newDoc);
            }

            //Insert a list of uploaded doc 
            await _unitOfWork.UploadedDocRepo.InsertAsync(docList);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting an uploaded doc.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = docList.Adapt<IList<UploadedDocDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Docs added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Processes and saves metadata for a batch of uploaded data files.
    public async Task<ServiceResponse<IList<UploadedDocDto>>> UploadDataFilesAsync(UploadDataDto uploadDataDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<IList<UploadedDocDto>>
        {
            Data = null,
            Message = "Failed to upload file. Please try again"
        };

        try
        {
            var uploadedDocs = new List<UploadedDoc>();

            foreach (var uploadItem in uploadDataDto.Files)
            {
                // Upload the file and get the result
                var fileUploadResult = await UploadFilesAsync(new List<IFormFile> { uploadItem }, uploadDataDto.Purpose);

                // Check upload result
                if (fileUploadResult.Data == null || !fileUploadResult.Data.Any())
                {
                    _logger.LogWarning("File upload failed or returned no result for file: {FileName}, Model ID: {ModelId}",
                        uploadItem.FileName, uploadDataDto.MLModelId);

                    serviceResponse.Message = $"File upload failed for model ID: {uploadDataDto.MLModelId}";
                    return serviceResponse;
                }
                // Map metadata from the upload DTO to the entity
                var docEntity = uploadDataDto.Adapt<UploadedDoc>();
                fileUploadResult.Data.FirstOrDefault().Adapt(docEntity);

                docEntity.CreatedByUserId = _userId;
                docEntity.LastModifiedByUserId = _userId;

                uploadedDocs.Add(docEntity);
            }

            // Save all uploaded document entities
            await _unitOfWork.UploadedDocRepo.InsertAsync(uploadedDocs);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save uploaded document records to the database.");
                return serviceResponse;
            }

            // Map entities to DTOs for response
            serviceResponse.Data = uploadedDocs.Adapt<IList<UploadedDocDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Documents uploaded successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while uploading documents.");
        }

        return serviceResponse;
    }

    // Retrieves list of uploaded docs
    public async Task<ServiceResponse<IEnumerable<UploadedDocDto>>> GetUploadedDocsAsync(Guid mlModelId, ExtractedDataType type)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<UploadedDocDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get uploaded docs
            var docs = await _unitOfWork.UploadedDocRepo
                        .GetByConditionAsync(w => w.MLModelId == mlModelId && w.Type == type)
                        .Include(c => c.CreatedByUser)
                        .OrderByDescending(o => o.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = docs.Adapt<IEnumerable<UploadedDocDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Docs retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Deletes a file from the server's storage based on the file URL.
    public ServiceResponse<bool> DeleteFileAsync(string fileUrl)
    {
        // Initialize ServiceResponse with a failed response
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

            var fileName = pathParts.Last();                     // The file name
            var subDirectory = pathParts.Reverse().Skip(1).First();  // The sub directory

            var filePath = Path.Combine(_fileUploadConfig.UploadDirectory, subDirectory, fileName);

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

    private async Task WriteFilesToStorage(List<(string FileName, MemoryStream Stream)> fileStreams, List<FileDetailDto> uploadedFiles, DocumentPurposeTypesEnum purpose)
    {
        foreach (var (fileName, stream) in fileStreams)
        {
            _logger.LogInformation("Uploading file: {FileName}.", fileName);

            try
            {
                // Create a subdirectory name based on the document purpose (e.g., "viewer" becomes "viewer-files")
                var subDirectory = $"{purpose}-files";

                // Construct the full path where the uploaded files will be saved.
                // Combines the base upload directory from configuration with the lowercase subdirectory name.

                var fullDirectoryPath = Path.Combine(_fileUploadConfig.UploadDirectory, subDirectory.ToLower());

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
                var fileUrl = $"/files/{subDirectory.ToLower()}/{uniqueFileName}".Replace("\\", "/");

                uploadedFiles.Add(new FileDetailDto
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

        // Check Audios category
        if (_fileUploadConfig.AllowedFileTypes.Audio.AllowedFileExtensions.Contains(extension))
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
            "pictures" => _fileUploadConfig.AllowedFileTypes.Pictures.AllowedFileExtensions,
            "documents" => _fileUploadConfig.AllowedFileTypes.Documents.AllowedFileExtensions,
            "videos" => _fileUploadConfig.AllowedFileTypes.Videos.AllowedFileExtensions,
            "audio" => _fileUploadConfig.AllowedFileTypes.Audio.AllowedFileExtensions,
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
            "pictures" => _fileUploadConfig.AllowedFileTypes.Pictures.MaxSizeMB,
            "documents" => _fileUploadConfig.AllowedFileTypes.Documents.MaxSizeMB,
            "videos" => _fileUploadConfig.AllowedFileTypes.Videos.MaxSizeMB,
            "audio" => _fileUploadConfig.AllowedFileTypes.Audio.MaxSizeMB,
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
    public ServiceResponse<FileDetailDto> DownloadFileAsync(string fileUrl)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<FileDetailDto>
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
                _logger.LogWarning("Invalid file URL structure. Expected format: '/files/{filename}'.", pathParts.Last());
                return serviceResponse;

            }

            var fileName = pathParts.Last();                     // The file name
            var subDirectory = pathParts.Reverse().Skip(1).First();  // The sub directory

            var filePath = Path.Combine(_fileUploadConfig.UploadDirectory, subDirectory, fileName);

            if (File.Exists(filePath))
            {

                _logger.LogInformation("File {FileName} exists at {FilePath}, proceeding with download.", fileName, filePath);

                // Prepare the file details for response
                var fileDetail = new FileDetailDto
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

    // Delete uploaded document
    public async Task<ServiceResponse<bool>> DeleteUploadedDocAsync(Guid documentId)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete uploaded document. Please try again."
        };

        try
        {
            // Try to get uploaded document record
            var uploadedDocument = await _unitOfWork.UploadedDocRepo
                .GetByConditionAsync(w =>
                    w.Id == documentId &&
                    w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (uploadedDocument == null)
            {
                _logger.LogInformation("Uploaded document does not exist.");
                serviceResponse.Message = "Uploaded document does not exist.";
                return serviceResponse;
            }
            // Extract the file paths (URLs) of the documents to delete
            var url = uploadedDocument.Path;

            // Delete the document
            _unitOfWork.UploadedDocRepo.Delete(uploadedDocument);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting an uploaded document.");
                return serviceResponse;
            }

            if (!DeleteFileByURL(url))
            {
                // If file deletion fails for a specific URL, log a warning
                _logger.LogWarning($"Failed to delete file at URL: {url}. It may not exist or there was an issue during deletion.");
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Uploaded document deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting uploaded document.");
        }

        return serviceResponse;
    }

    // Delete multiple uploaded documents
    public async Task<ServiceResponse<bool>> DeleteUploadedDocsAsync(List<Guid> documentIds)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete uploaded documents. Please try again."
        };

        try
        {
            // Try to get uploaded document record
            var uploadedDocuments = await _unitOfWork.UploadedDocRepo
                .GetByConditionAsync(w =>
                    documentIds.Contains(w.Id)
                )
                .ToListAsync();

            // If no documents match the given IDs, return an informative message
            if (!uploadedDocuments.Any())
            {
                _logger.LogInformation($"No documents found for the provided IDs: {string.Join(", ", documentIds)}. Deletion skipped.");
                serviceResponse.Message = "No documents found with the specified IDs.";
                return serviceResponse;
            }

            // Log the number of documents found and about to be deleted
            _logger.LogInformation($"Found {uploadedDocuments.Count} document(s) to be deleted. Proceeding with deletion.");

            // Extract file paths (URLs) of the documents for later deletion from the file system
            var urls = uploadedDocuments.Select(doc => doc.Path).ToList();

            // Delete the documents from the database
            _unitOfWork.UploadedDocRepo.Delete(uploadedDocuments);

            // Persist the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to commit document deletions to the database.");
                return serviceResponse;
            }

            // Log the successful database deletion
            _logger.LogInformation($"Successfully deleted {uploadedDocuments.Count} document(s) from the database.");

            // If there are file paths to delete, attempt to delete each file from the file system
            if (urls.Any())
            {
                foreach (var url in urls)
                {
                    if (!DeleteFileByURL(url))
                    {
                        // Log a warning if file deletion fails
                        _logger.LogWarning($"Failed to delete file at URL: {url}. The file may not exist or there was an issue with the deletion.");
                    }
                }
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Uploaded document(s) deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting multiple uploaded documents.");
        }

        return serviceResponse;
    }

    // Deletes multiple uploaded documents associated with a specific ML model.
    public async Task<ServiceResponse<bool>> DeleteUploadedDocsByModelAsync(Guid mlModelId)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete uploaded documents. Please try again."
        };

        try
        {
            // Fetch documents associated with the provided ML model ID
            var uploadedDocuments = await _unitOfWork.UploadedDocRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId)
                .ToListAsync();

            // Check if no documents were found for the given ML model ID
            if (!uploadedDocuments.Any())
            {
                _logger.LogInformation($"No documents found for the ML model with ID: {mlModelId}. Deletion skipped.");
                serviceResponse.Message = "No documents found for the specified ML model.";
                return serviceResponse;
            }

            // Log how many documents are about to be deleted
            _logger.LogInformation($"Found {uploadedDocuments.Count} document(s) associated with ML model ID: {mlModelId}. Proceeding with deletion.");

            // Extract the file paths (URLs) of the documents to delete
            var urls = uploadedDocuments.Select(s => s.Path).ToList();

            // Delete the documents associated with the specified ML model
            _unitOfWork.UploadedDocRepo.Delete(uploadedDocuments);

            // Save the changes to persist the deletions in the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes after attempting to delete documents.");
                return serviceResponse;
            }

            // Check if any URLs (file paths) were extracted to delete associated files from the file system
            if (urls != null && urls.Any())
            {
                foreach (var url in urls)
                {
                    _logger.LogInformation($"Attempting to delete file associated with document at URL: {url}");

                    if (!DeleteFileByURL(url))
                    {
                        // If file deletion fails for a specific URL, log a warning
                        _logger.LogWarning($"Failed to delete file at URL: {url}. It may not exist or there was an issue during deletion.");
                    }
                }
            }

            // Log successful deletion and update the response with success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{uploadedDocuments.Count} uploaded document(s) successfully deleted.";

            _logger.LogInformation($"{uploadedDocuments.Count} document(s) deleted successfully for ML model ID: {mlModelId}.");
        }
        catch (Exception ex)
        {
            // Log the error if something goes wrong during the deletion process
            _logger.LogError(ex, "An error occurred while deleting documents associated with the specified ML model.");
        }

        return serviceResponse;
    }

    // Attempts to delete a file from the specified url.
    private bool DeleteFileByURL(string url)
    {
        try
        {
            // Ensure the file path is not null or empty
            if (string.IsNullOrEmpty(url))
            {
                _logger.LogWarning("Provided file URL is null or empty. File deletion skipped.");
                return false;
            }

            // Extract file name (last part of the URL) and subdirectory (second to last part)
            // Assuming defaulUrl is in a format like "/subdirectory/filename"
            var urlParts = url.Trim('/').Split('/');

            if (urlParts.Length < 2)
            {
                _logger.LogWarning("URL does not contain a valid file path and subdirectory. File deletion skipped.");
                return false;
            }

            var subDirectory = urlParts[urlParts.Length - 2];
            var fileName = urlParts[urlParts.Length - 1];

            // Combine to get the full file path
            var filePath = Path.Combine(_fileUploadConfig.UploadDirectory, subDirectory, fileName);

            // Check if the file exists at the specified location
            if (File.Exists(filePath))
            {
                // Log the file deletion attempt
                _logger.LogInformation($"Initiating deletion of the file at path: {filePath}");

                // Proceed with deleting the file
                File.Delete(filePath);

                // Log successful file deletion
                _logger.LogInformation($"File successfully deleted from path: {filePath}");
                return true;
            }
            else
            {
                // Log that the file was not found at the specified location
                _logger.LogWarning($"File not found at path: {filePath}. Deletion not performed.");
                return false;
            }
        }
        catch (Exception ex)
        {
            // Log any errors encountered during the file deletion process
            _logger.LogError(ex, "An error occurred while attempting to delete the file.");
            return false;
        }
    }
}