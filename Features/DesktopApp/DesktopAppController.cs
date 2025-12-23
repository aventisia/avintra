namespace AccountsAPIs.Controllers;

// TODO: Implment IDesktopAppService and inject it
// TODO: Implment logger

[Route("desktop-app")]
[ApiController]
public class DesktopAppController : BaseApiController
{
    private readonly FileUploadConfig _fileUploadConfig;
    private readonly GeneralConfig _generalConfig;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public DesktopAppController(
        FileUploadConfig fileUploadConfig,
        GeneralConfig generalConfig,
        IWebHostEnvironment webHostEnvironment)
    {
        _fileUploadConfig = fileUploadConfig;
        _generalConfig = generalConfig;
        _webHostEnvironment = webHostEnvironment;
    }

    // GET: /desktop-app/download/
    [HttpGet("download")]
    public IActionResult DownloadVersion()
    {
        // Get the file path and file name for the latest version
        var (filePath, fileName, signatureFilePath, message) = GetLatestVersion();

        // If file path is null or empty, return NotFound
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        // Read file bytes and return as file result
        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        return File(fileBytes, "application/octet-stream", fileName);
    }

    // GET: /desktop-app/download/{version}
    [HttpGet("download/{version}")]
    public IActionResult DownloadVersion(string version)
    {
        // Get the file path and file name for the latest version
        var (filePath, fileName, signatureFilePath, message) = GetLatestVersion(version);

        // If file path is null or empty, return NotFound
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        // Read file bytes and return as file result
        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        return File(fileBytes, "application/octet-stream", fileName);
    }

    // GET: /desktop-app/update/{target}/{arch}/{currentVersion}
    [HttpGet("update/{target}/{arch}/{currentVersion}")]
    public IActionResult CheckUpdate(string target, string arch, string currentVersion)
    {
        // Get the file path and file name for the latest version
        var (filePath, fileName, signatureFilePath, message) = GetLatestVersion();

        // If file path is null or empty, return NotFound
        if (string.IsNullOrEmpty(filePath))
            return NotFound(message);

        // Get the latest verison out. Assuming version is in the format WorcDesktopApp_{version}_x64-setup.exe
        var latestVersion = Path.GetFileNameWithoutExtension(fileName).Split('_')[1];
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
                    url = $"{_generalConfig.AppDomain}/api/desktop-app/download/{latestVersion}"
                }
            }
        };

        return Ok(response);
    }

    // Helper to get the latest version from a file or database
    private (string?, string?, string?, string) GetLatestVersion(string? version = null)
    {
        // Set WorcDesktopApp base name based on environment
        var appName = "WorcDesktopApp";
        if (_webHostEnvironment.IsEnvironment("Development"))
            appName += "_DEV";
        else if (_webHostEnvironment.IsEnvironment("UAT"))
            appName += "_UAT";
        else
            appName += "";
        
        // Get base path
        var basePath = Path.Combine(_fileUploadConfig.UploadDirectory, "binaries");

        // Ensure the latest folder exists
        if (!Directory.Exists(basePath))
            return (null, null, null, "Binary folder not found.");

        // Initialize search pattern
        var searchPattern = string.Empty;

        // Set search pattern based on version
        if (!string.IsNullOrEmpty(version))
            searchPattern = $"{appName}_{version}_x64-setup.exe";
        else
            searchPattern = $"{appName}_*_x64-setup.exe";

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
        if (!System.IO.File.Exists(signatureFilePath))
            return (null, null, null, "Signature file not found for the latest version.");

        // Return the latest file path, file name, and success message
        return (latestFilePath, fileName, signatureFilePath, "Latest version found.");
    }
}