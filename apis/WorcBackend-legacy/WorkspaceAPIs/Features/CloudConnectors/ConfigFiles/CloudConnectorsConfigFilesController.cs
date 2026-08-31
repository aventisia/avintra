[Route("cloud-connector/config-file")]
[ApiController]
[Authorize]
public class CloudConnectorsConfigFilesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public CloudConnectorsConfigFilesController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet("{*filePath}")]
    public IActionResult GetConfigFile(string filePath)
    {
        var root = Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles");
        var fullPath = Path.GetFullPath(Path.Combine(root, filePath ?? ""));
        if (!fullPath.StartsWith(root) || !System.IO.File.Exists(fullPath))
            return NotFound();

        // // Set CORS headers
        // if (Request.Headers.ContainsKey("Origin"))
        // {
        //     Response.Headers["Access-Control-Allow-Origin"] = Request.Headers["Origin"];
        //     Response.Headers["Access-Control-Allow-Credentials"] = "true";
        //     Response.Headers["Vary"] = "Origin";
        // }

        var contentType = filePath?.EndsWith(".json", StringComparison.OrdinalIgnoreCase) == true
            ? "application/json"
            : "application/octet-stream";
        return PhysicalFile(fullPath, contentType);
    }
}
