namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents an image uploaded to a custom UI builder project.
/// </summary>
public class UiBuilderAssetDto
{
    /// <summary>
    /// Gets or sets the asset record's primary key.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name generated code uses to reach the asset. Max 64 characters.
    /// </summary>
    [StringLength(64)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the image media type. Max 100 characters.
    /// </summary>
    [StringLength(100)]
    public required string ContentType { get; set; }

    /// <summary>
    /// Gets or sets the base64-encoded image bytes. Required on upload; returned only by the asset content endpoint.
    /// </summary>
    public string? DataBase64 { get; set; }

    /// <summary>
    /// Gets or sets the image size in bytes.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public int SizeBytes { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the asset was uploaded.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }
}
