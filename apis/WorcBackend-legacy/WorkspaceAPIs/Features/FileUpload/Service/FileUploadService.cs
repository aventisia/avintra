using System.Threading.Tasks;

namespace WorkspaceAPIs.Services;

public class FileUploadService(ILogger<FileUploadService> logger, IUploadFileService uploadFileService, IUnitOfWork unitOfWork) : IFileUploadService
{
    #region Fields
    private readonly ILogger<FileUploadService> _logger = logger;
    private readonly IUploadFileService _uploadFileService = uploadFileService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    #endregion

    // Uploads multiple files for a given step and returns the saved file URLs.

    public async Task<ServiceResponse<string[]>> UploadFilesAsync(IFormFile[] files, bool isTemp = true)
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

            var response = isTemp ? await _uploadFileService.UploadFilesTemporaryAsync([.. files]) : await _uploadFileService.UploadFilesAsync([.. files]);

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


    public async Task<ServiceResponse<string>> UploadFileAsync(IFormFile file, bool isTemp = true)
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

            var response = isTemp ? await _uploadFileService.UploadFilesTemporaryAsync([file]) : await _uploadFileService.UploadFilesAsync([file]);

            // Check if the upload was successful; if not, set the error message and return
            if (response.StatusCode != 200)
            {
                serviceResponse.Message = response.Message;
                return serviceResponse;
            }

            // If successful, assign the file path to the newQueue's SpecificDataSchemaPath
            serviceResponse.Data = response.Data?.FirstOrDefault()?.Path;


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
    public async Task<ServiceResponse<bool>> DeleteFileAsync(string fileUrl)
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

            var response = await _uploadFileService.DeleteFileAsync(fileUrl);

            if (response.StatusCode != 200)
            {
                serviceResponse.Message = response.Message;
                return serviceResponse;
            }

            // If successful, assign the file path to the newQueue's SpecificDataSchemaPath
            serviceResponse.Data = response.Data;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Files deleted successfully.";
            _logger.LogInformation(response.Message);

        }
        catch (Exception ex)
        {
            // Catch any unexpected exceptions during the file deletion process
            _logger.LogError(serviceResponse.Message, ex);
        }

        // Return the service response with the status of the operation
        return serviceResponse;
    }

    public async Task<ServiceResponse<string>> GetFileByUrlOrFileIdAsync(string fileOrRemoteUrl, bool isTemp = true)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = "No file found",
            Message = "File deletion failed."
        };

        try
        {
            if (string.IsNullOrWhiteSpace(fileOrRemoteUrl) || !Uri.IsWellFormedUriString(fileOrRemoteUrl, UriKind.Absolute))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError(serviceResponse.Message);
                return serviceResponse;
            }

            if (Uri.IsWellFormedUriString(fileOrRemoteUrl, UriKind.Absolute))
            {
                var downloadResponse = await _uploadFileService.DownloadFileOnServerAsync(fileOrRemoteUrl, isTemp);
                serviceResponse.Data = downloadResponse.Data;
                _logger.LogInformation(downloadResponse.Message);
            }
            else
            {
                var downloadResponse = await _uploadFileService.DownloadFileAsync(fileOrRemoteUrl, isTemp);
                serviceResponse.Data = fileOrRemoteUrl;
                _logger.LogInformation(downloadResponse.Message);
            }
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "File downloaded at server successfully.";
        }
        catch (Exception ex)
        {
            // Catch any unexpected exceptions during the file deletion process
            _logger.LogError(serviceResponse.Message, ex);
        }

        // Return the service response with the status of the operation
        return serviceResponse;
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
            // Get the list of files with valid paths
            var files = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w => !string.IsNullOrEmpty(w.Path))
                .AsNoTracking()
                .ToListAsync();

            var needToUpdates = new List<TemplateResource>();

            // Iterate through files and attempt to upload each
            foreach (var file in files)
            {
                var response = await _uploadFileService.UploadFileToBlobAsync(file.Path, file.TenantId.Value);

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
                _unitOfWork.TemplateResourceRepo.Update(needToUpdates);

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
