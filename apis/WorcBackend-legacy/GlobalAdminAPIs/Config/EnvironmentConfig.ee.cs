namespace GlobalAdminAPIs.Config;

public class EnvironmentConfig
{
    // Database and Storage
    public string PostgresqlHost { get; set; } = string.Empty;
    public int PostgresqlPort { get; set; }
    public string PostgresqlUsername { get; set; } = string.Empty;
    public string PostgresqlPassword { get; set; } = string.Empty;
    
    // JWT
    public string JwtSecretKey { get; set; } = string.Empty;
    
    // SMTP
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string SmtpMailFromName { get; set; } = string.Empty;
    public string SmtpMailFromAddress { get; set; } = string.Empty;
}