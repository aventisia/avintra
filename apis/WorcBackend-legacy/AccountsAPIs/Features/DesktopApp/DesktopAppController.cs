namespace AccountsAPIs.Controllers;

// TODO: Implment IDesktopAppService and inject it
// TODO: Implment logger

[Route("desktop-app")]
[ApiController]
public class DesktopAppController : BaseApiController
{
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly EnvironmentConfig _environmentConfig;
    
    public DesktopAppController(
        AppDefaultConfig appDefaultConfig,
        EnvironmentConfig environmentConfig)
    {
        _appDefaultConfig = appDefaultConfig;
        _environmentConfig = environmentConfig;
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

    // GET: /desktop-app/update/{target}/{arch}/{currentVersion}
    [HttpGet("update/{target}/{arch}/{currentVersion}")]
    public IActionResult CheckUpdate(string target, string arch, string currentVersion)
    {
        // Get the file path and file name for the latest version
        var (filePath, fileName, signatureFilePath, message) = GetLatestVersion("AvintraDesktopApp", "x64-setup.exe");

        // If file path is null or empty, return NotFound
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        // Get the latest verison out. Assuming version is in the format AvintraDesktopApp_{version}_x64-setup.exe
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
        var (filePath, fileName, _, message) = GetLatestVersion("DesktopExecutor", "win-x64.zip");
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        var latestVersion = ParseVersion(fileName, "DesktopExecutor", "win-x64.zip");
        return Ok(new
        {
            version = latestVersion,
            url = $"https://{_environmentConfig.AppBaseUrl}/accounts/api/desktop-app/desktop-executor/download/{latestVersion}"
        });
    }

    // GET: /desktop-app/desktop-executor/download/
    [HttpGet("desktop-executor/download")]
    public IActionResult DownloadDesktopExecutor()
    {
        return DownloadVersionedFile("DesktopExecutor", "win-x64.zip");
    }

    // GET: /desktop-app/desktop-executor/download/{version}
    [HttpGet("desktop-executor/download/{version}")]
    public IActionResult DownloadDesktopExecutor(string version)
    {
        return DownloadVersionedFile("DesktopExecutor", "win-x64.zip", version);
    }

    // Helper to resolve and stream a versioned binary matching the given prefix and suffix.
    private IActionResult DownloadVersionedFile(string prefix, string suffix, string? version = null)
    {
        var (filePath, fileName, _, message) = GetLatestVersion(prefix, suffix, version);

        // If file path is null or empty, return NotFound
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        // Read file bytes and return as file result
        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        return File(fileBytes, "application/octet-stream", fileName);
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

        // Sort files by creation time and take the latest one
        var latestFilePath = files.OrderByDescending(f => System.IO.File.GetCreationTime(f)).First();
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
        var version = name.Substring(prefix.Length + 1);
        if (version.EndsWith("_" + suffix, StringComparison.OrdinalIgnoreCase))
            version = version.Substring(0, version.Length - suffix.Length - 1);
        return version;
    }
}