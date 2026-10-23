namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the result of a credential validation process,
/// including encrypted values, sanitized input data, and validation remarks.
/// </summary>
public class VaultCredentialValidationResult
{
    /// <summary>
    /// Gets or sets the unique identifier for this validation result.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Gets or sets a dictionary of encrypted key-value pairs,
    /// where the key is the name of the sensitive field and the value is the encrypted data.
    /// </summary>
    public Dictionary<string, string> EncryptedValues { get; set; } = new Dictionary<string, string>();

    /// <summary>
    /// Gets or sets the sanitized version of the original input data as a JSON string,
    /// with sensitive values masked or removed.
    /// </summary>
    public string SanitizedDataJson { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a remark message indicating the outcome of the validation process.
    /// </summary>
    public string Remark { get; set; } = string.Empty;
}