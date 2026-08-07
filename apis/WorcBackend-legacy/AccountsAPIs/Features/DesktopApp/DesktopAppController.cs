using Microsoft.Extensions.Caching.Memory;

namespace AccountsAPIs.Controllers;

// TODO: Implement IDesktopAppService and inject it
// TODO: Implement logger

[Route("desktop-app")]
[ApiController]
public class DesktopAppController : BaseApiController
{
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IMemoryCache _cache;

    public DesktopAppController(
        AppDefaultConfig appDefaultConfig,
        EnvironmentConfig environmentConfig,
        IMemoryCache cache)
    {
        _appDefaultConfig = appDefaultConfig;
        _environmentConfig = environmentConfig;
        _cache = cache;
    }

    // GET: /desktop-app/download/
    [HttpGet("download")]
    public IActionResult DownloadVersion()
    {
        return DownloadVersionedFile("AvintraDesktopApp", "x64-setup.exe");
    }

    // GET: /desktop-app/download/{version}
    [HttpGet("download/{version}")]
    public IActionResult DownloadVersion(string version)
    {
        return DownloadVersionedFile("AvintraDesktopApp", "x64-setup.exe", version);
    }

    // GET: /desktop-app/download/{version}.sig
    [HttpGet("download/{version}.sig")]
    public IActionResult DownloadSignature(string version)
    {
        var (filePath, fileName, signatureFilePath, message) = GetLatestVersion("AvintraDesktopApp", "x64-setup.exe", version);

        if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(signatureFilePath))
            return NotFound(message);

        if (!System.IO.File.Exists(signatureFilePath))
            return NotFound("Signature file not found.");

        var signatureBytes = System.IO.File.ReadAllBytes(signatureFilePath);
        return File(signatureBytes, "application/octet-stream", $"{fileName}.sig");
    }

    // GET: /desktop-app/update/{target}/{arch}/{currentVersion}
    [HttpGet("update/{target}/{arch}/{currentVersion}")]
    public IActionResult CheckUpdate(string target, string arch, string currentVersion)
    {
        // Get the file path and file name for the latest version
        var (filePath, fileName, signatureFilePath, message) = GetLatestVersion("AvintraDesktopApp", "x64-setup.exe");

        // If file path is null or empty, return NotFound
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        // Get the latest version out. Assuming version is in the format AvintraDesktopApp_{version}_x64-setup.exe
        string latestVersion = ParseVersion(fileName, "AvintraDesktopApp", "x64-setup.exe");

        var updateNotes = "Bug fixes and improvements.";
        var pubDate = DateTime.UtcNow.ToString("o"); // ISO 8601 format

        // Check if the current version is the same as the latest version
        if (currentVersion == latestVersion)
            return NoContent(); // HTTP 204 - no update needed

        // Read the signature file
        var signature = System.IO.File.ReadAllText(signatureFilePath).Trim();

        var response = new
        {
            version = latestVersion,
            notes = updateNotes,
            pub_date = pubDate,
            platforms = new Dictionary<string, object>
            {
                ["windows-x86_64"] = new
                {
                    signature,
                    url = $"https://{_environmentConfig.AppBaseUrl}/accounts/api/desktop-app/download/{latestVersion}"
                }
            }
        };

        return Ok(response);
    }

    // GET: /desktop-app/desktop-executor/latest
    [HttpGet("desktop-executor/latest")]
    public IActionResult GetDesktopExecutorLatest()
    {
        const string cacheKey = "desktop-executor-latest";
        if (_cache.TryGetValue(cacheKey, out object? cached))
            return Ok(cached);

        var (filePath, fileName, _, message) = GetLatestVersion("AvintraDesktopRunner", "win-x64.zip");
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        var latestVersion = ParseVersion(fileName, "AvintraDesktopRunner", "win-x64.zip");
        var result = new
        {
            version = latestVersion,
            url = $"https://{_environmentConfig.AppBaseUrl}/accounts/api/desktop-app/desktop-executor/download/{latestVersion}"
        };

        _cache.Set(cacheKey, result, TimeSpan.FromSeconds(60));
        return Ok(result);
    }

    // GET: /desktop-app/desktop-executor/download/
    [HttpGet("desktop-executor/download")]
    public IActionResult DownloadDesktopExecutor()
    {
        return DownloadVersionedFile("AvintraDesktopRunner", "win-x64.zip");
    }

    // GET: /desktop-app/desktop-executor/download/{version}
    [HttpGet("desktop-executor/download/{version}")]
    public IActionResult DownloadDesktopExecutor(string version)
    {
        return DownloadVersionedFile("AvintraDesktopRunner", "win-x64.zip", version);
    }

    // GET: /desktop-app/script/Install-AvintraDesktopRunner.ps1
    [HttpGet("script/Install-AvintraDesktopRunner.ps1")]
    public IActionResult GetInstallScript()
    {
        var scriptsDir = Path.Combine(_appDefaultConfig.FileUploadConfig.UploadDirectory, "scripts");
        var scriptPath = Path.Combine(scriptsDir, "Install-AvintraDesktopRunner.ps1");

        if (!System.IO.File.Exists(scriptPath))
            return NotFound("Installation script not found.");

        var scriptStream = System.IO.File.OpenRead(scriptPath);
        return File(scriptStream, "application/x-powershell", "Install-AvintraDesktopRunner.ps1");
    }

    // GET: /desktop-app/script/Download-AvintraDesktopRunner.ps1
    [HttpGet("script/Download-AvintraDesktopRunner.ps1")]
    public IActionResult GetDownloadScript()
    {
        var scriptsDir = Path.Combine(_appDefaultConfig.FileUploadConfig.UploadDirectory, "scripts");
        var scriptPath = Path.Combine(scriptsDir, "Download-AvintraDesktopRunner.ps1");

        if (!System.IO.File.Exists(scriptPath))
            return NotFound("Download script not found.");

        var scriptStream = System.IO.File.OpenRead(scriptPath);
        return File(scriptStream, "application/x-powershell", "Download-AvintraDesktopRunner.ps1");
    }

    // GET: /desktop-app/download-manifest
    [HttpGet("download-manifest")]
    public IActionResult GetDownloadManifest()
    {
        const string cacheKey = "desktop-app-download-manifest";
        if (_cache.TryGetValue(cacheKey, out object? cached))
            return Ok(cached);

        // Each product exposes its own full version list so the Desktop App and the
        // Desktop Runner can be at different versions independently.
        var manifest = new DownloadManifestDto
        {
            DesktopApp = GetProductManifest("AvintraDesktopApp", "x64-setup.exe", "nsis"),
            DesktopExecutor = GetProductManifest("AvintraDesktopRunner", "win-x64.zip", "zip")
        };

        _cache.Set(cacheKey, manifest, TimeSpan.FromSeconds(60));
        return Ok(manifest);
    }

    // Helper to resolve and stream a versioned binary matching the given prefix and suffix.
    private IActionResult DownloadVersionedFile(string prefix, string suffix, string? version = null)
    {
        var (filePath, fileName, _, message) = GetLatestVersion(prefix, suffix, version);

        // If file path is null or empty, return NotFound
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        // Stream the file to the client instead of buffering the whole binary in memory.
        var fileStream = System.IO.File.OpenRead(filePath);
        return File(fileStream, "application/octet-stream", fileName);
    }

    // Helper to get the latest version from a file or database
    private (string?, string?, string?, string) GetLatestVersion(string prefix, string suffix, string? version = null)
    {
        // Get base path
        var basePath = Path.Combine(_appDefaultConfig.FileUploadConfig.UploadDirectory, "binaries");

        // Ensure the latest folder exists
        if (!Directory.Exists(basePath))
            return (null, null, null, "Binary folder not found.");

        // Initialize search pattern
        var searchPattern = string.Empty;

        // Set search pattern based on version
        if (!string.IsNullOrEmpty(version))
            searchPattern = $"{prefix}_{version}_{suffix}";
        else
            searchPattern = $"{prefix}_*_{suffix}";

        // Get files matching the search pattern
        var files = Directory.GetFiles(basePath, searchPattern);

        // File not found
        if (files.Length == 0)
            return (null, null, null, "No versions available.");

        // Sort files by parsed version (newest first) and take the latest one.
        // Creation time is unreliable on Linux and rsync preserves mtime, so we
        // sort semantically by the version embedded in the file name.
        var latestFilePath = files
            .OrderByDescending(f => ParseVersion(Path.GetFileName(f), prefix, suffix), Comparer<string>.Create(CompareVersions))
            .First();
        var fileName = Path.GetFileName(latestFilePath);

        // Get the signature file path
        var signatureFilePath = Path.Combine(basePath, $"{fileName}.sig");

        // Check if the signature file exists
        if (suffix == "x64-setup.exe" && !System.IO.File.Exists(signatureFilePath))
            return (null, null, null, "Signature file not found for the latest version.");

        // Return the latest file path, file name, and success message
        return (latestFilePath, fileName, signatureFilePath, "Latest version found.");
    }

    // Extracts the version segment from a file name like "{prefix}_{version}_{suffix}".
    private static string ParseVersion(string fileName, string prefix, string suffix)
    {
        var name = Path.GetFileNameWithoutExtension(fileName);
        var suffixWithoutExtension = Path.GetFileNameWithoutExtension(suffix);
        var prefixPart = $"{prefix}_";
        var suffixPart = $"_{suffixWithoutExtension}";

        if (name.StartsWith(prefixPart, StringComparison.OrdinalIgnoreCase))
            name = name.Substring(prefixPart.Length);

        if (name.EndsWith(suffixPart, StringComparison.OrdinalIgnoreCase))
            name = name.Substring(0, name.Length - suffixPart.Length);

        return name;
    }

    // Compares two version strings semantically (e.g. "0.1.9" < "0.1.10").
    // Falls back to ordinal comparison when a segment is not numeric.
    private static int CompareVersions(string? x, string? y)
    {
        if (string.IsNullOrEmpty(x) && string.IsNullOrEmpty(y)) return 0;
        if (string.IsNullOrEmpty(x)) return -1;
        if (string.IsNullOrEmpty(y)) return 1;

        var xParts = x.Split('.');
        var yParts = y.Split('.');
        var length = Math.Max(xParts.Length, yParts.Length);

        for (var i = 0; i < length; i++)
        {
            var xPart = i < xParts.Length ? xParts[i] : "0";
            var yPart = i < yParts.Length ? yParts[i] : "0";

            if (int.TryParse(xPart, out var xNum) && int.TryParse(yPart, out var yNum))
            {
                if (xNum != yNum) return xNum.CompareTo(yNum);
            }
            else
            {
                var cmp = string.Compare(xPart, yPart, StringComparison.Ordinal);
                if (cmp != 0) return cmp;
            }
        }

        return 0;
    }

    // Returns every discovered version for the given prefix/suffix, sorted newest first by version.
    private List<(string filePath, string fileName, string? signatureFilePath, string version)> GetAllVersions(string prefix, string suffix)
    {
        var basePath = Path.Combine(_appDefaultConfig.FileUploadConfig.UploadDirectory, "binaries");
        if (!Directory.Exists(basePath))
            return new List<(string filePath, string fileName, string? signatureFilePath, string version)>();

        var searchPattern = $"{prefix}_*_{suffix}";
        var files = Directory.GetFiles(basePath, searchPattern)
            .OrderByDescending(f => ParseVersion(Path.GetFileName(f), prefix, suffix), Comparer<string>.Create(CompareVersions))
            .ToList();

        return files.Select(filePath =>
        {
            var fileName = Path.GetFileName(filePath);
            var signatureFilePath = Path.Combine(basePath, $"{fileName}.sig");
            var hasSignature = System.IO.File.Exists(signatureFilePath);
            var version = ParseVersion(fileName, prefix, suffix);
            return (filePath, fileName, hasSignature ? signatureFilePath : null, version);
        }).ToList();
    }

    private ProductManifestDto GetProductManifest(string prefix, string suffix, string installerType)
    {
        var isDesktopApp = suffix == "x64-setup.exe";
        var downloadPath = isDesktopApp ? "download" : "desktop-executor/download";
        var versions = GetAllVersions(prefix, suffix);

        if (versions.Count == 0)
        {
            return new ProductManifestDto
            {
                Versions =
                [
                    new ProductVersionDto
                    {
                        Version = string.Empty,
                        Notes = "No versions available.",
                        Artifacts = GetPlaceholderArtifacts(installerType)
                    }
                ]
            };
        }

        var versionDtos = versions
            .Select(v => BuildProductVersionDto(v, installerType, isDesktopApp, downloadPath))
            .ToList();

        return new ProductManifestDto { Versions = versionDtos };
    }

    private ProductVersionDto BuildProductVersionDto(
        (string filePath, string fileName, string? signatureFilePath, string version) versionInfo,
        string installerType,
        bool isDesktopApp,
        string downloadPath)
    {
        var hasFile = !string.IsNullOrEmpty(versionInfo.filePath);
        var version = versionInfo.version;
        var baseUrl = $"https://{_environmentConfig.AppBaseUrl}/accounts/api/desktop-app/{downloadPath}/{version}";

        var windowsArtifact = new ArtifactDto
        {
            Platform = "windows",
            Architecture = "x86_64",
            Available = hasFile,
            InstallerType = installerType,
            Size = hasFile ? new FileInfo(versionInfo.filePath).Length : null,
            Url = hasFile ? baseUrl : string.Empty,
            SignatureUrl = isDesktopApp && hasFile && !string.IsNullOrEmpty(versionInfo.signatureFilePath)
                ? $"{baseUrl}.sig"
                : null
        };

        return new ProductVersionDto
        {
            Version = version,
            Notes = "Bug fixes and improvements.",
            Artifacts =
            [
                windowsArtifact,
                new ArtifactDto { Platform = "linux", Architecture = "x86_64", Available = false },
                new ArtifactDto { Platform = "macos", Architecture = "x86_64", Available = false },
                new ArtifactDto { Platform = "macos", Architecture = "arm64", Available = false }
            ]
        };
    }

    private static List<ArtifactDto> GetPlaceholderArtifacts(string installerType)
    {
        return
        [
            new ArtifactDto
            {
                Platform = "windows",
                Architecture = "x86_64",
                Available = false,
                InstallerType = installerType,
                Url = string.Empty,
                SignatureUrl = null
            },
            new ArtifactDto { Platform = "linux", Architecture = "x86_64", Available = false },
            new ArtifactDto { Platform = "macos", Architecture = "x86_64", Available = false },
            new ArtifactDto { Platform = "macos", Architecture = "arm64", Available = false }
        ];
    }
}
