namespace AspNetToolkit.Config;

public class AppDefaultConfig
{
    // Project Info
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public string PlatformVersion { get; set; } = string.Empty;
    
    // Global Admin Service URLs
    public string GlobalAdminApiBaseUrl { get; set; } = string.Empty;

    // Endpoint Configurations
    public List<string> TenantlessEndpoints { get; set; } = new();
    public List<string> TenantIdInHeaderEndpoints { get; set; } = new();

    // Complex Configs
    public required FileUploadConfig FileUploadConfig { get; set; }
    public required RateLimiterConfig RateLimiterConfig { get; set; }
}