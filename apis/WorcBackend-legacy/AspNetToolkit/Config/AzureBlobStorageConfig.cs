namespace AspNetToolkit.Config;

/// <summary>
/// Represents configuration settings required to connect to Azure Blob Storage.
/// </summary>
public class AzureBlobStorageConfig
{
    /// <summary>
    /// Gets or sets the connection string used to authenticate with Azure Blob Storage.
    /// </summary>
    public required string ConnectionString { get; set; }
}
