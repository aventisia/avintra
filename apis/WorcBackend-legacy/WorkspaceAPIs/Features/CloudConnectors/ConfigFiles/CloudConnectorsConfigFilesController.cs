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

        // Route Corsair per-plugin configs to the server path when configured and
        // present; otherwise fall back to the codebase folder (local development).
        var corsairRoot = _configuration["Corsair:ConfigRoot"];
        if (string.IsNullOrWhiteSpace(corsairRoot))
        {
            var uploadDirectory = _appDefaultConfig.FileUploadConfig.UploadDirectory;
            if (!string.IsNullOrWhiteSpace(uploadDirectory))
            {
                corsairRoot = Path.Combine(uploadDirectory, "configs", "Corsair");
            }
        }
        var isCorsairPath = filePath?.StartsWith("Corsair/", StringComparison.OrdinalIgnoreCase) == true;
        var root = isCorsairPath && !string.IsNullOrWhiteSpace(corsairRoot) && Directory.Exists(corsairRoot)
            ? Path.GetFullPath(corsairRoot)
            : codebaseRoot;

        // The filePath already carries the "Corsair/" prefix (e.g.
        // "Corsair/Openai/ModelsListConnector.json"). corsairRoot IS the Corsair
        // folder, so strip the prefix before combining to avoid a double
        // "Corsair/Corsair/" path.
        var relativePath = isCorsairPath && root != codebaseRoot
            ? filePath!.Substring("Corsair/".Length)
            : filePath ?? "";

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
