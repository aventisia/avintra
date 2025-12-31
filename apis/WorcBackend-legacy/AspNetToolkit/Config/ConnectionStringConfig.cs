namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for connection strings.
/// </summary>
public class ConnectionStringConfig
{
    /// <summary>
    /// Gets or sets the connection string for the AppDb.
    /// </summary>
    public required ConnectionString AppDb { get; set; }

    /// <summary>
    /// Gets or sets the connection string for the TenantDb.
    /// </summary>
    public required ConnectionString TenantDb { get; set; }
}

/// <summary>
/// Represents a connection string configuration.
/// </summary>
public class ConnectionString
{
    /// <summary>
    /// Gets or sets the credentials for the connection string.
    /// </summary>
    public required string Credentials { get; set; }

    /// <summary>
    /// Gets or sets the host for the connection string.
    /// </summary>
    public required string Host { get; set; }

    /// <summary>
    /// Gets or sets the database for the connection string.
    /// </summary>
    public required string Database { get; set; }

    /// <summary>
    /// Gets or sets any other additional information for the connection string.
    /// </summary>
    public required string Other { get; set; }
}