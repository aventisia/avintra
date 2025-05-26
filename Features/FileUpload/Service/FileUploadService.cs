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

            var response = _uploadFileService.DeleteFileAsync(fileUrl);

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
}
