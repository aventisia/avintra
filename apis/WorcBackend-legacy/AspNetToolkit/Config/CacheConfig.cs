namespace AspNetToolkit.Config;

/// <summary>
/// Configuration settings for cache management.
/// </summary>
public class CacheConfig
{
    /// <summary>
    /// Gets or sets the connection string used for cache storage.
    /// </summary>
    public required string CacheConnectionString { get; set; }
}