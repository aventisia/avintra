using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Microsoft.Graph.Models;
using System.Text.Json;

namespace WorkspaceAPIs.Features.CloudConnectors.Azure;

public class AzureConnectorsService : IAzureConnectorsService
{
    private readonly ILogger<AzureConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;
    private readonly ICloudConnectorsVaultCredentialService _cloudConnectorsVaultCredentialService;
    public AzureConnectorsService(
        ILogger<AzureConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService, ICloudConnectorsVaultCredentialService cloudConnectorsVaultCredentialService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
        _cloudConnectorsVaultCredentialService = cloudConnectorsVaultCredentialService;
    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Response = null,
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };
        string? azureConnectionString = null;
        try
        {
            var (connectionString, credentialFailure) = await GetBlobConnectionStringAsync(cloudConnectorReqDto.CredentialName);
            azureConnectionString = connectionString;
            if (azureConnectionString == null)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = credentialFailure;
                serviceResponse.Data.Response = credentialFailure;
                return serviceResponse;
            }
            // Convert string action to enum
            if (!Enum.TryParse<AzureActionEnum>(cloudConnectorReqDto.Action, true, out var azureAction))
            {
                _logger.LogWarning("Invalid Azure action: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = $"Unsupported Azure action: '{cloudConnectorReqDto.Action}'. Valid actions:.";
                return serviceResponse;
            }
            // Create Azure client
            var blobServiceClient = new BlobServiceClient(azureConnectionString);
            var azureResponse = await TakeAzureBlobStorageAsync(azureAction, cloudConnectorReqDto.Payload, blobServiceClient, azureConnectionString);

            if (azureResponse == null)
            {
                _logger.LogWarning("Azure action failed or returned null for action: {Action}", azureAction);
                serviceResponse.Message = "Azure action execution failed.";
                return serviceResponse;
            }

            serviceResponse.Data.Response = azureResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Azure connector invoked successfully.";

        }
        catch (RequestFailedException ex) when (ex.Status is 401 or 403)
        {
            _logger.LogWarning("Azure rejected credential {CredentialName} with status {Status}.", CloudConnectorLogRedactor.SanitizeForLog(cloudConnectorReqDto.CredentialName), ex.Status);
            serviceResponse.StatusCode = 400;
            serviceResponse.Message = CredentialResolution.ToLogMessage(
                CredentialResolutionReason.RejectedUpstream,
                cloudConnectorReqDto.CredentialName,
                CloudConnectorLogRedactor.RedactProviderReason(ex.Message, CloudConnectorLogRedactor.WithEscapedForms(azureConnectionString)));
            serviceResponse.Data.Response = serviceResponse.Message;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking Azure connector.");
            var message = $"Error: {CloudConnectorLogRedactor.RedactProviderReason(ex.Message, CloudConnectorLogRedactor.WithEscapedForms(azureConnectionString))}";
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = message;
            serviceResponse.Data.Response = message;
        }
        return serviceResponse;
    }

    private async Task<(string? ConnectionString, string? Failure)> GetBlobConnectionStringAsync(string credentialName)
    {
        var resolution = await _cloudConnectorsVaultCredentialService.ResolveVaultCredentialAsync(credentialName);
        if (!resolution.IsSuccess)
        {
            return (null, resolution.FailureMessage);
        }

        if (resolution.Credential!.Data == null ||
            !resolution.Credential.Data.TryGetValue("ConnectionString", out var blobConnectionString) ||
            string.IsNullOrWhiteSpace(blobConnectionString?.ToString()))
        {
            _logger.LogWarning("No 'ConnectionString' value in vault credential Data for Name: {CredentialName}", CloudConnectorLogRedactor.SanitizeForLog(credentialName));
            return (null, CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "ConnectionString"));
        }

        return (blobConnectionString!.ToString(), null);
    }

    private async Task<object?> TakeAzureBlobStorageAsync(AzureActionEnum azureAction, object payload, BlobServiceClient blobServiceClient, string? connectionString)

    {
        try
        {
            // Validate payload format
            if (payload is not System.Collections.Generic.IDictionary<string, object> dict)
                return new { Error = "Invalid payload format. Expected Dictionary<string, object>." };

            if (!dict.TryGetValue("containerName", out var toObj) || toObj == null)
                return new { Error = "'containerName' is required in payload." };
            string containerName = toObj?.ToString() ?? string.Empty;

            switch (azureAction)
            {
                case AzureActionEnum.CreateBlobContainer:
                    {

                        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                        await containerClient.CreateIfNotExistsAsync();

                        return new
                        {
                            IsSuccess = true,
                            Message = "Container created successfully.",
                            ContainerName = containerName
                        };
                    }

                case AzureActionEnum.GetContainerSize:
                    {

                        // Get a client for the specified blob container.
                        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

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
                        return new
                        {
                            TotalSize = totalSize,
                            Message = " Container size retrieved successfully",
                            ContainerName = containerName
                        };
                    }
                case AzureActionEnum.DeleteContainer:
                    {
                        // Get a client for the specified blob container.
                        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                        // Delete the container only if it exists to avoid throwing an exception.
                        await containerClient.DeleteIfExistsAsync();

                        return new
                        {
                            Message = "Container Deleted Successfully"
                        };
                    }

                case AzureActionEnum.UploadFile:
                    {
                        if (!dict.TryGetValue("fileName", out var fileNameObj) || fileNameObj == null)
                            return new { IsSuccess = false, Message = "'fileName' is required in payload." };

                        string fileName = fileNameObj?.ToString() ?? string.Empty;

                        if (!dict.TryGetValue("fileStream", out var fileStreamObj) || fileStreamObj == null)
                            return new { IsSuccess = false, Message = "'fileStream' is required in payload." };

                        // Convert base64 string to Stream
                        Stream? fileStream = null;
                        try
                        {
                            string base64Content = fileStreamObj.ToString() ?? string.Empty;
                            byte[] fileBytes = Convert.FromBase64String(base64Content);
                            fileStream = new MemoryStream(fileBytes);
                        }
                        catch (FormatException)
                        {
                            return new { IsSuccess = false, Message = "Invalid base64 format for fileStream." };
                        }

                        if (fileStream == null)
                            return new { IsSuccess = false, Message = "'fileStream' must be a valid Stream object." };

                        if (string.IsNullOrWhiteSpace(fileName))
                            return new { IsSuccess = false, Message = "Invalid fileName format - contains illegal characters" };

                        string contentType = "application/octet-stream";
                        if (dict.TryGetValue("contentType", out var contentTypeObj) &&
                            contentTypeObj is string ct && !string.IsNullOrEmpty(ct))
                        {
                            contentType = ct;
                        }

                        // Create clients
                        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                        await containerClient.CreateIfNotExistsAsync();

                        var blobClient = containerClient.GetBlobClient(fileName);

                        // Upload
                        if (fileStream.CanSeek)
                        {
                            fileStream.Position = 0;
                        }

                        await blobClient.UploadAsync(fileStream, new BlobUploadOptions
                        {
                            HttpHeaders = new BlobHttpHeaders
                            {
                                ContentType = contentType
                            }
                        });

                        return new
                        {
                            IsSuccess = true,
                            Message = "File uploaded successfully.",
                            BlobUrl = blobClient.Uri.ToString(),
                            ContainerName = containerName,
                            FileName = fileName
                        };
                    }

                case AzureActionEnum.DownloadFile:
                    {
                        if (!dict.TryGetValue("fileName", out var fileNameObj) || fileNameObj == null)
                            return new { IsSuccess = false, Message = "'fileName' is required in payload." };

                        string fileName = fileNameObj?.ToString() ?? string.Empty;

                        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                        var blobClient = containerClient.GetBlobClient(fileName);

                        if (!await blobClient.ExistsAsync())
                        {
                            return new { IsSuccess = false, Message = $"File '{fileName}' not found." };
                        }

                        var memoryStream = new MemoryStream();
                        await blobClient.DownloadToAsync(memoryStream);
                        memoryStream.Position = 0;

                        var properties = await blobClient.GetPropertiesAsync();
                        return new
                        {
                            IsSuccess = true,
                            Message = "File downloaded successfully.",
                            FileName = Path.GetFileName(fileName),
                            FileBase64 = Convert.ToBase64String(memoryStream.ToArray()),
                            ContentType = properties.Value.ContentType ?? "application/octet-stream",
                            BlobUrl = blobClient.Uri.ToString()
                        };
                    }

                case AzureActionEnum.DownloadFileToLocation:
                    {
                        if (!dict.TryGetValue("fileName", out var fileNameObj) || fileNameObj == null)
                            return new { IsSuccess = false, Message = "'fileName' is required in payload." };

                        string fileName = fileNameObj?.ToString() ?? string.Empty;

                        if (!dict.TryGetValue("localSavePath", out var localSavePathObj) || localSavePathObj == null)
                            return new { IsSucess = false, Message = "localSavePath is required" };

                        string localSavePath = localSavePathObj?.ToString() ?? string.Empty;

                        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                        var blobClient = containerClient.GetBlobClient(fileName);

                        if (!await blobClient.ExistsAsync())
                        {
                            return new
                            {
                                IsSuccess = false,
                                Message = $"Blob '{fileName}' not found."
                            };
                        }

                        var directoryPath = Path.GetDirectoryName(localSavePath);
                        if (!string.IsNullOrEmpty(directoryPath) && !Directory.Exists(directoryPath))
                        {
                            Directory.CreateDirectory(directoryPath);
                        }

                        await blobClient.DownloadToAsync(localSavePath);

                        return new
                        {
                            IsSuccess = true,
                            Message = "File downloaded and saved successfully.",
                            SavedPath = localSavePath,
                            BlobUrl = blobClient.Uri.ToString()
                        };
                    }

                default:
                    return new { Error = "Invalid Azure action." };
            }
        }
        catch (RequestFailedException ex) when (ex.Status is 401 or 403)
        {
            // IMPORTANT NOTE: a rejected credential must reach the invoke path, which alone knows the
            // credential name needed for the execution-log message.
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure operation failed");
            return new { Error = CloudConnectorLogRedactor.RedactProviderReason(ex.Message, connectionString) };
        }
    }
}