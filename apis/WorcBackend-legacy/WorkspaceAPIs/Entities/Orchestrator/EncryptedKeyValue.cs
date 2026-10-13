namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an encrypted key-value pair (e.g., credentials, API tokens) associated with a specific tenant.
/// </summary>
[Table("ws_EncryptedKeyValues")]
public class EncryptedKeyValue
{
    /// <summary>
    /// Gets or sets the unique identifier of the encrypted secret.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the key or name that identifies the secret (e.g., "APIKey", "Username").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the encrypted value associated with the key.
    /// </summary>
    public required string Value { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the related VaultCredential entity.
    /// </summary>
    public required Guid VaultCredentialId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property linking to the associated VaultCredential entity.
    /// </summary>
    [ForeignKey("VaultCredentialId")]
    public virtual VaultCredential? VaultCredential { get; set; }
}
