namespace GlobalAdminAPIs.Config;

public class AppDefaultConfig
{
    // Project Info
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public string ProjectVersion { get; set; } = string.Empty;

    // Instance data
    public string AppBaseUrl { get; set; } = string.Empty;
    public string FirstAdminUserEmail { get; set; } = string.Empty;
    public List<string> CorsOrigins { get; set; } = new List<string>();

    // Complex Configs
    public required RateLimiterConfig RateLimiterConfig { get; set; }
}