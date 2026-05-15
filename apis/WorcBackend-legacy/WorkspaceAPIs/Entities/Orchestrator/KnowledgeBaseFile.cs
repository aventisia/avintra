namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents metadata for a file associated with a Knowledge Base.
/// Actual file content is not stored in this record, only the metadata and its vectorization status.
/// NOTE: we don't store the file permanently in our system; we only keep it temporarily 
/// during the vectorization process, and then discard it after we're done. 
/// This is to avoid storage bloat and potential PII issues. The file content is processed,
/// converted into vectors, and then discarded immediately after processing.
/// </summary>
[Table("worc_KBFiles")]
public class KnowledgeBaseFile : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the Knowledge Base this file belongs to.
    /// </summary>
    public Guid KnowledgeBaseId { get; set; }

    /// <summary>
    /// Gets or sets the original name of the file.
    /// </summary>
    [MaxLength(255)]
    public required string FileName { get; set; }

    /// <summary>
    /// Gets or sets the file extension (e.g., .pdf, .txt).
    /// </summary>
    [MaxLength(50)]
    public string? Extension { get; set; }

    /// <summary>
    /// Gets or sets the MIME/content type of the file.
    /// </summary>
    [MaxLength(100)]
    public string? ContentType { get; set; }

    /// <summary>
    /// Gets or sets the size of the file in bytes.
    /// </summary>
    public long SizeInBytes { get; set; }

    /// <summary>
    /// Gets or sets the number of chunks created from this file during vectorization.
    /// </summary>
    public int ChunksCount { get; set; }

    /// <summary>
    /// Gets or sets the current vectorization status of the file.
    /// </summary>
    public VectorizationStatusEnum Status { get; set; } = VectorizationStatusEnum.Pending;

    /// <summary>
    /// Gets or sets any error message that occurred during vectorization.
    /// </summary>
    public string? VectorizationErrorMessage { get; set; }

    /// <summary>
    /// Navigation property to the parent Knowledge Base.
    /// </summary>
    [ForeignKey("KnowledgeBaseId")]
    public virtual KnowledgeBase? KnowledgeBase { get; set; }
}
