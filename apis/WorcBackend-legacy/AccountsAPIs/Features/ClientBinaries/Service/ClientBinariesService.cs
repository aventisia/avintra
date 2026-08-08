using Microsoft.Extensions.Caching.Memory;

namespace AccountsAPIs.Services;

/// <summary>
/// Serves client binaries (Desktop App and Runner App) from the configured upload directory.
/// </summary>
public class ClientBinariesService : IClientBinariesService
{
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IMemoryCache _cache;

    public ClientBinariesService(
        AppDefaultConfig appDefaultConfig,
        EnvironmentConfig environmentConfig,
        IMemoryCache cache)
    {
        _appDefaultConfig = appDefaultConfig;
        _environmentConfig = environmentConfig;
        _cache = cache;
    }

    // Retrieves the download manifest listing every available version of both products.
    public async Task<ServiceResponse<DownloadManifestDto>> GetDownloadManifestAsync()
    {
        // Initialize a service response with failure defaults
        var serviceResponse = ServiceResponse<DownloadManifestDto>.Create("Failed to retrieve the download manifest.", 500);

        const string cacheKey = "client-binaries-download-manifest";
        if (_cache.TryGetValue(cacheKey, out DownloadManifestDto? cached))
            return serviceResponse.Update(null, 200, cached);

        // Each product exposes its own full version list so the Desktop App and the
        // Runner app can be at different versions independently.
        var manifest = new DownloadManifestDto
        {
            Desktop = ClientBinariesHelper.GetProductManifest(
                _appDefaultConfig,
                _environmentConfig,
                ClientBinariesHelper.DesktopPrefix,
                ClientBinariesHelper.DesktopSuffix,
                "nsis"),
            Runner = ClientBinariesHelper.GetProductManifest(
                _appDefaultConfig,
                _environmentConfig,
                ClientBinariesHelper.RunnerPrefix,
                ClientBinariesHelper.RunnerSuffix,
                "zip")
        };

        _cache.Set(cacheKey, manifest, TimeSpan.FromSeconds(60));
        return serviceResponse.Update(null, 200, manifest);
    }

    // Retrieves the latest available version of the Runner App.
    public async Task<ServiceResponse<RunnerLatestDto>> GetRunnerAppLatestAsync()
    {
        // Initialize a service response with failure defaults
        var serviceResponse = ServiceResponse<RunnerLatestDto>.Create("Failed to retrieve the latest Runner App version.", 500);

        const string cacheKey = "runner-app-latest";
        if (_cache.TryGetValue(cacheKey, out RunnerLatestDto? cached))
            return serviceResponse.Update(null, 200, cached);

        // Resolve the latest Runner App binary
        var (filePath, fileName, _, message) = ClientBinariesHelper.GetLatestVersion(
            _appDefaultConfig,
            ClientBinariesHelper.RunnerPrefix,
            ClientBinariesHelper.RunnerSuffix);
        if (string.IsNullOrEmpty(filePath))
            return serviceResponse.Update(message, 404);

        // Extract the version from the file name and build the download URL
        var latestVersion = ClientBinariesHelper.ParseVersion(
            fileName,
            ClientBinariesHelper.RunnerPrefix,
            ClientBinariesHelper.RunnerSuffix);
        var result = new RunnerLatestDto
        {
            Version = latestVersion,
            Url = $"https://{_environmentConfig.AppBaseUrl}/accounts/api/binaries/runner/download/{latestVersion}"
        };

        _cache.Set(cacheKey, result, TimeSpan.FromSeconds(60));
        return serviceResponse.Update(null, 200, result);
    }

    // Checks whether an update is available for the Desktop App at the given current version.
    public async Task<ServiceResponse<UpdateCheckDto>> CheckUpdateAsync(string target, string arch, string currentVersion)
    {
        // Initialize a service response with failure defaults
        var serviceResponse = ServiceResponse<UpdateCheckDto>.Create("Failed to check for updates.", 500);

        // Resolve the latest Desktop App binary
        var (filePath, fileName, signatureFilePath, message) = ClientBinariesHelper.GetLatestVersion(
            _appDefaultConfig,
            ClientBinariesHelper.DesktopPrefix,
            ClientBinariesHelper.DesktopSuffix);
        if (string.IsNullOrEmpty(filePath))
            return serviceResponse.Update(message, 404);

        // Extract the latest version from the file name
        var latestVersion = ClientBinariesHelper.ParseVersion(
            fileName,
            ClientBinariesHelper.DesktopPrefix,
            ClientBinariesHelper.DesktopSuffix);

        // No update needed when the current version matches the latest
        if (currentVersion == latestVersion)
            return serviceResponse.Update(null, 204);

        // Read the signature file
        var signature = System.IO.File.ReadAllText(signatureFilePath).Trim();

        var updateCheck = new UpdateCheckDto
        {
            Version = latestVersion,
            Notes = "Bug fixes and improvements.",
            PubDate = DateTime.UtcNow.ToString("o"), // ISO 8601 format
            Platforms = new Dictionary<string, UpdateCheckPlatformDto>
            {
                ["windows-x86_64"] = new UpdateCheckPlatformDto
                {
                    Signature = signature,
                    Url = $"https://{_environmentConfig.AppBaseUrl}/accounts/api/binaries/desktop/download/{latestVersion}"
                }
            }
        };

        return serviceResponse.Update(null, 200, updateCheck);
    }

    // Resolves the latest (or a specific) Desktop App binary for download.
    public BinaryFileResult GetDesktopDownload(string? version)
    {
        return ResolveDownload(ClientBinariesHelper.DesktopPrefix, ClientBinariesHelper.DesktopSuffix, version);
    }

    // Resolves the signature file for a specific Desktop App version.
    public BinaryFileResult GetDesktopSignature(string version)
    {
        // Resolve the binary to derive the signature file name
        var (filePath, fileName, signatureFilePath, message) = ClientBinariesHelper.GetLatestVersion(
            _appDefaultConfig,
            ClientBinariesHelper.DesktopPrefix,
            ClientBinariesHelper.DesktopSuffix,
            version);

        // Signature requires both the binary and its signature file to exist
        if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(signatureFilePath))
            return new BinaryFileResult { Message = message };

        if (!System.IO.File.Exists(signatureFilePath))
            return new BinaryFileResult { Message = "Signature file not found." };

        return new BinaryFileResult
        {
            FilePath = signatureFilePath,
            FileName = $"{fileName}.sig",
            ContentType = "application/octet-stream"
        };
    }

    // Resolves the latest (or a specific) Runner App binary for download.
    public BinaryFileResult GetRunnerDownload(string? version)
    {
        return ResolveDownload(ClientBinariesHelper.RunnerPrefix, ClientBinariesHelper.RunnerSuffix, version);
    }

    // Resolves the Runner App installation PowerShell script.
    public BinaryFileResult GetInstallScript()
    {
        var scriptsDir = Path.Combine(_appDefaultConfig.FileUploadConfig.UploadDirectory, "scripts");
        var scriptPath = Path.Combine(scriptsDir, "Install-AvintraRunnerService.ps1");

        if (!System.IO.File.Exists(scriptPath))
            return new BinaryFileResult { Message = "Installation script not found." };

        return new BinaryFileResult
        {
            FilePath = scriptPath,
            FileName = "Install-AvintraRunnerService.ps1",
            ContentType = "application/x-powershell"
        };
    }

    // Resolves a versioned binary matching the given prefix and suffix.
    private BinaryFileResult ResolveDownload(string prefix, string suffix, string? version)
    {
        var (filePath, fileName, _, message) = ClientBinariesHelper.GetLatestVersion(_appDefaultConfig, prefix, suffix, version);

        // If file path is null or empty, return a not-found result
        if (string.IsNullOrEmpty(filePath))
            return new BinaryFileResult { Message = message };

        return new BinaryFileResult
        {
            FilePath = filePath,
            FileName = fileName,
            ContentType = "application/octet-stream"
        };
    }
}
