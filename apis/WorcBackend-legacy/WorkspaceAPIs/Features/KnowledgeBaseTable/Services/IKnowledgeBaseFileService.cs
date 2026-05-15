namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing Knowledge Base file metadata.
/// </summary>
public interface IKnowledgeBaseFileService
{
    /// <summary>
    /// Retrieves all files registered under a specific knowledge base.
    /// </summary>
    Task<ServiceResponse<IEnumerable<KnowledgeBaseFileDto>>> GetKnowledgeBaseFilesAsync(Guid knowledgeBaseId);

    /// <summary>
    /// Registers an uploaded file under a specific knowledge base.
    /// </summary>
    Task<ServiceResponse<KnowledgeBaseFileDto>> RegisterKnowledgeBaseFileAsync(Guid knowledgeBaseId, KBRegisterFileDto dto);

    /// <summary>
    /// Registers raw text as a file-like source under a specific knowledge base.
    /// </summary>
    Task<ServiceResponse<KnowledgeBaseFileDto>> RegisterKnowledgeBaseTextAsync(Guid knowledgeBaseId, KBRegisterTextDto dto);

    /// <summary>
    /// Updates the vectorization status of a registered file after ingestion.
    /// </summary>
    Task<ServiceResponse<KnowledgeBaseFileDto>> UpdateFileStatusAsync(Guid knowledgeBaseId, Guid fileId, KBUpdateFileStatusDto dto);

    /// <summary>
    /// Deletes a registered file metadata record from a knowledge base.
    /// </summary>
    Task<ServiceResponse<bool>> DeleteKnowledgeBaseFileAsync(Guid knowledgeBaseId, Guid fileId);
}
