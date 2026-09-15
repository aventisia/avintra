[Route("cloud-connector/config-file")]
[ApiController]
[Authorize]
public class CloudConnectorsConfigFilesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;
    private readonly AppDefaultConfig _appDefaultConfig;

    public CloudConnectorsConfigFilesController(
        IWebHostEnvironment env,
        IConfiguration configuration,
        AppDefaultConfig appDefaultConfig)
    {
        _env = env;
        _configuration = configuration;
        _appDefaultConfig = appDefaultConfig;
    }

    [HttpGet("{*filePath}")]
    public IActionResult GetConfigFile(string filePath)
    {
        // The thousands of per-plugin Corsair configs are deployed to a shared
        // server path (derived from the upload directory) so they do not bloat
        // the codebase. Everything else (Camel, in-house connectors, the global
        // Cloud Connector mapping, and the small Corsair sibling artifacts) lives
        // in the codebase ConfigFiles folder.
        var codebaseRoot = Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles");

        // Route Corsair artifacts (per-plugin configs under "Corsair/" and the
        // dedicated action-selector mapping file) to the Corsair root. On the
        // server this is the shared path derived from the configured upload
        // directory (e.g. /var/www/aventisia.com/files/configs/Corsair). Locally
        // it falls back to the codebase ConfigFiles/Corsair folder, which holds
        // the generated per-plugin configs and mapping file.
        var corsairRoot = _configuration["Corsair:ConfigRoot"];
        if (string.IsNullOrWhiteSpace(corsairRoot))
        {
            var uploadDirectory = _appDefaultConfig.FileUploadConfig.UploadDirectory;
            if (!string.IsNullOrWhiteSpace(uploadDirectory))
            {
                corsairRoot = Path.Combine(uploadDirectory, "configs", "Corsair");
            }
        }
        if (string.IsNullOrWhiteSpace(corsairRoot) || !Directory.Exists(corsairRoot))
        {
            // Local development: the server path is absent, so use the codebase
            // ConfigFiles/Corsair folder where the generator writes the configs.
            corsairRoot = Path.Combine(codebaseRoot, "Corsair");
        }

        // Corsair artifacts are the per-plugin configs under "Corsair/" and the
        // dedicated action-selector mapping file ("CorsairActionSelectorMappingFile.json").
        var isCorsairPath = filePath?.StartsWith("Corsair", StringComparison.OrdinalIgnoreCase) == true;
        var root = isCorsairPath && Directory.Exists(corsairRoot)
            ? Path.GetFullPath(corsairRoot)
            : codebaseRoot;

        // corsairRoot IS the Corsair folder. Per-plugin configs carry the
        // "Corsair/" prefix (e.g. "Corsair/Openai/ModelsListConnector.json"), so
        // strip it before combining to avoid a double "Corsair/Corsair/" path.
        // The mapping file name is used as-is.
        var relativePath = filePath ?? "";
        if (isCorsairPath && root != codebaseRoot
            && filePath!.StartsWith("Corsair/", StringComparison.OrdinalIgnoreCase))
        {
            relativePath = filePath.Substring("Corsair/".Length);
        }

        var fullPath = Path.GetFullPath(Path.Combine(root, relativePath));
        if (!fullPath.StartsWith(root) || !System.IO.File.Exists(fullPath))
            return NotFound();

        return PhysicalFile(fullPath, GetContentType(filePath));
    }

    private static string GetContentType(string? filePath)
    {
        return filePath?.EndsWith(".json", StringComparison.OrdinalIgnoreCase) == true
            ? "application/json"
            : "application/octet-stream";
    }
}
