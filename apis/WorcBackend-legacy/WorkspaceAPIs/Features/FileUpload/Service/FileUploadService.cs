using System.Threading.Tasks;

namespace WorkspaceAPIs.Services;

public class FileUploadService(ILogger<FileUploadService> logger, IUploadFileService uploadFileService, IUnitOfWork unitOfWork, IHttpClientFactory httpClientFactory, IM365ConnectorsService m365ConnectorsService) : IFileUploadService
{
    #region Fields
    private readonly ILogger<FileUploadService> _logger = logger;
    private readonly IUploadFileService _uploadFileService = uploadFileService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly IM365ConnectorsService _m365ConnectorsService = m365ConnectorsService;
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
            // Get the list of files where the Path is not null, not empty, and starts with "/"
            var files = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w => !string.IsNullOrEmpty(w.Path) && w.Path.StartsWith("/"))
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation($"Found {files.Count} file(s) to upload.");

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

    // Retrieves a file as a Base64 data URL. Supports local files, SharePoint files, public HTTP/HTTPS URLs, and existing Base64 data URLs.
    public async Task<ServiceResponse<string>> GetDataUrlAsync(Guid? credentialId, string fileUrl)
    {
        // Initialize the default failure response.
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to retrieve file data URL. Please try again."
        };

        try
        {
            // Validate the input.
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                serviceResponse.Message = "File URL is null or empty.";
                _logger.LogError("{Message}", serviceResponse.Message);
                return serviceResponse;
            }

            // If the input is already a Base64 data URL, return it directly.
            if (fileUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                serviceResponse.Data = fileUrl;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Data URL retrieved successfully.";
                return serviceResponse;
            }

            // Retrieve the file bytes based on the input source.
            byte[] fileBytes = fileUrl switch
            {
                // Download from SharePoint or OneDrive.
                _ when IsMicrosoft365FileUrl(fileUrl) =>
                    !credentialId.HasValue
                        ? throw new UnauthorizedAccessException("CredentialId is required for SharePoint access.")
                        : await DownloadMicrosoft365FileAsync(fileUrl, credentialId.Value),

                // Download from a public HTTP/HTTPS URL.
                _ when Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri) &&
                       (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) =>
                    await DownloadPublicAsync(fileUrl),

                // Read from an existing local file.
                _ when File.Exists(fileUrl) =>
                    await ReadLocalFileAsync(fileUrl),
                // Unsupported source.
                _ =>
                    throw new ArgumentException("Unsupported file path format.")
            };

            // Determine the MIME type for the file.
            var mimeType = GetMimeType(fileUrl);

            // Convert the file to a Base64 data URL.
            var base64 = Convert.ToBase64String(fileBytes);
            var dataUrl = $"data:{mimeType};base64,{base64}";

            serviceResponse.Data = dataUrl;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "File data URL retrieved successfully.";

            _logger.LogInformation("Successfully retrieved data URL for '{FileUrl}'.", fileUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while retrieving the data URL for file '{FileUrl}'.",
                fileUrl);
        }

        return serviceResponse;
    }

    private async Task<byte[]> ReadLocalFileAsync(string path)
    {
        if (!File.Exists(path))
            throw new FileNotFoundException($"Local file not found: {path}");

        return await File.ReadAllBytesAsync(path);
    }

    private async Task<byte[]> DownloadPublicAsync(string url)
    {
        var client = _httpClientFactory.CreateClient();
        return await client.GetByteArrayAsync(url);
    }

    // Downloads a file from SharePoint using the Microsoft Graph API.
    // Resolves the site, drive, and item identifiers from the provided SharePoint URL before downloading the file content.
    private async Task<byte[]> DownloadMicrosoft365FileAsync(string sharePointUrl, Guid credentialId)
    {
        // Retrieve an access token for Microsoft Graph.
        var accessToken = await _m365ConnectorsService.GetM365AccessTokenAsync(credentialId);

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new UnauthorizedAccessException("Failed to obtain Microsoft 365 access token.");
        }

        // Parse the SharePoint file URL.
        var fileUri = new Uri(sharePointUrl);

        // Extract the SharePoint tenant domain.
        var domain = fileUri.Host;

        // Split the URL path into segments.
        var segments = fileUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

        // Example:
        // /sites/Finance/Shared Documents/Reports/Test.pdf
        // Locate the site or team segment in the URL.
        int siteIndex = Array.FindIndex(
            segments,
            s => s.Equals("sites", StringComparison.OrdinalIgnoreCase) ||
                 s.Equals("teams", StringComparison.OrdinalIgnoreCase));

        // Validate the URL format.
        if (siteIndex < 0 || segments.Length < siteIndex + 4)
        {
            throw new InvalidOperationException("Invalid SharePoint file URL.");
        }

        // Construct the site path.
        // Example: /sites/Finance
        var sitePath = "/" + string.Join('/', segments.Take(siteIndex + 2));

        // Extract the relative file path.
        // Example: Shared Documents/Reports/Test.pdf
        var relativeFilePath = GetRelativeFilePath(fileUri);

        // Retrieve the SharePoint site identifier.
        var siteJson = await HttpClientHelper.GetAsync(
            $"https://graph.microsoft.com/v1.0/sites/{domain}:{sitePath}",
            accessToken);

        var siteId = siteJson.RootElement.GetProperty("id").GetString();

        // Retrieve the default document library (drive) identifier.
        var driveJson = await HttpClientHelper.GetAsync(
            $"https://graph.microsoft.com/v1.0/sites/{siteId}/drive",
            accessToken);

        var driveId = driveJson.RootElement.GetProperty("id").GetString();

        // Retrieve the file (drive item) identifier using its relative path.
        var itemJson = await HttpClientHelper.GetAsync(
            $"https://graph.microsoft.com/v1.0/drives/{driveId}/root:/{relativeFilePath}",
            accessToken);

        var itemId = itemJson.RootElement.GetProperty("id").GetString();

        // Refresh the access token before downloading the file.
        accessToken = await _m365ConnectorsService.GetM365AccessTokenAsync(credentialId);

        // Build the Microsoft Graph endpoint used to download the file content.
        var contentUrl = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/content";

        // Create an HTTP client configured with the authorization header.
        var httpClient = _httpClientFactory.CreateClient();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/octet-stream"));

        // Send the request to download the file.
        var fileResponse = await httpClient.GetAsync(contentUrl).ConfigureAwait(false);

        // Read the response body for troubleshooting if the request fails.
        var responseContent = await fileResponse.Content.ReadAsStringAsync().ConfigureAwait(false);

        // Throw an exception if the download request was unsuccessful.
        fileResponse.EnsureSuccessStatusCode();

        // Return the downloaded file as a byte array.
        var fileBytes = await fileResponse.Content.ReadAsByteArrayAsync().ConfigureAwait(false);

        return fileBytes;
    }

    // Method to get the relative file path from the URL
    private string GetRelativeFilePath(Uri fileUri)
    {
        var segments = fileUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        int siteRootIdx = Array.FindIndex(segments, s => s.Equals("sites", StringComparison.OrdinalIgnoreCase) || s.Equals("teams", StringComparison.OrdinalIgnoreCase));

        if (siteRootIdx == -1 || segments.Length <= siteRootIdx + 3)
        {
            _logger.LogWarning("Invalid file path in URL: {FileUrl}", fileUri);
            return string.Empty;  // Return empty string if file path is invalid
        }

        string relativeFilePath = string.Join('/', segments.Skip(siteRootIdx + 3)); // e.g., General/m365_connector_testing.xlsx
        return Uri.UnescapeDataString(relativeFilePath);
    }

    private static bool IsMicrosoft365FileUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return false;
        }

        return uri.Host.EndsWith(".sharepoint.com", StringComparison.OrdinalIgnoreCase) ||
               uri.Host.Equals("onedrive.live.com", StringComparison.OrdinalIgnoreCase) ||
               uri.Host.EndsWith(".my.sharepoint.com", StringComparison.OrdinalIgnoreCase);
    }

    private string GetMimeType(string filePath)
    {
        var extension = Path.GetExtension(filePath)?.ToLowerInvariant();

        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            ".csv" => "text/csv",
            ".json" => "application/json",
            ".xml" => "application/xml",
            _ => "application/octet-stream"
        };
    }
}