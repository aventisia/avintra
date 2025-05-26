namespace WorkspaceAPIs.Services;

public class FileUploadService(ILogger<FileUploadService> logger, FileUploadConfig fileUploadConfig, IUploadFileService uploadFileService) : IFileUploadService
{
    #region Fields
    private readonly ILogger<FileUploadService> _logger = logger;
    private readonly FileUploadConfig _fileUploadConfig = fileUploadConfig;
    private readonly IUploadFileService _uploadFileService = uploadFileService;

    #endregion

    // Uploads multiple files for a given step and returns the saved file URLs.

    public async Task<ServiceResponse<string[]>> UploadFilesAsync(IFormFile[] files)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<string[]>
        {
            Data = null,
            Message = "Files not uploaded."
        };

        try
        {
            // Check if the specific data schema file is provided
            if (files == null || files.Length < 1)
            {
                serviceResponse.Message = "No files to found to upload";
                serviceResponse.StatusCode = 400;
                return serviceResponse;
            }

            var response = await _uploadFileService.UploadFilesAsync(files.ToList());

            // Check if the upload was successful; if not, set the error message and return
            if (response.StatusCode != 200)
            {
                serviceResponse.Message = response.Message;
                return serviceResponse;
            }

            // If successful, assign the file path to the newQueue's SpecificDataSchemaPath
            serviceResponse.Data = response.Data?.Select(f => f.Path).ToArray();
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


    public async Task<ServiceResponse<string>> UploadFileAsync(IFormFile file)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "File not uploaded."
        };

        try
        {
            // Check if the specific data schema file is provided
            if (file == null)
            {
                serviceResponse.Message = "No file to found to upload";
                serviceResponse.StatusCode = 400;
                return serviceResponse;
            }

            var response = await _uploadFileService.UploadSingleFileAsync(file);

            // Check if the upload was successful; if not, set the error message and return
            if (response.StatusCode != 200)
            {
                serviceResponse.Message = response.Message;
                return serviceResponse;
            }

            // If successful, assign the file path to the newQueue's SpecificDataSchemaPath
            serviceResponse.Data = response.Data.Path;


            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "File uploaded successfully.";
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
    public ServiceResponse<bool> DeleteFileAsync(string fileUrl)
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
            var fullDirectoryPath = Path.Combine(_fileUploadConfig.UploadDirectory);

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
    
    // Downloads a file based on the provided file URL.
    public ServiceResponse<FileDetailDto> DownloadFileAsync(string fileUrl)
    {
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

            var fileName = pathParts.Last();   // The file name

            var filePath = Path.Combine(_fileUploadConfig.UploadDirectory, fileName);

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
}
