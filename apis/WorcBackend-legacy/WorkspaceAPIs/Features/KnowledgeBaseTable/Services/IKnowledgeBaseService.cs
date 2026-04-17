namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing Knowledge Bases.
/// </summary>
public interface IKnowledgeBaseService
{
    /// <summary>
    /// Retrieves all knowledge bases created by or accessible to the current user.
    /// </summary>
    /// <returns>The task result contains the service response with the list of knowledge base details.</returns>
    Task<ServiceResponse<IEnumerable<KnowledgeBaseDto>>> GetKnowledgeBasesAsync();

    /// <summary>
    /// Checks the availability of a knowledge base name for the current user.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the knowledge base name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsKnowledgeBaseNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Inserts a new knowledge base.
    /// </summary>
    /// <param name="knowledgeBaseDto">The data required to insert the knowledge base.</param>
    /// <returns>The task result contains the service response with the inserted knowledge base details.</returns>
    Task<ServiceResponse<KnowledgeBaseDto>> InsertKnowledgeBaseAsync(KnowledgeBaseDto knowledgeBaseDto);

    /// <summary>
    /// Updates an existing knowledge base.
    /// </summary>
    /// <param name="knowledgeBaseDto">The data required to update the knowledge base.</param>
    /// <returns>The task result contains the service response with the updated knowledge base details.</returns>
    Task<ServiceResponse<KnowledgeBaseDto>> UpdateKnowledgeBaseAsync(KnowledgeBaseDto knowledgeBaseDto);

    /// <summary>
    /// Deletes a knowledge base by its ID.
    /// </summary>
    /// <param name="id">The ID of the knowledge base to delete.</param>
    /// <returns>The task result contains the service response indicating whether the knowledge base was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteKnowledgeBaseAsync(Guid id);

    /// <summary>
    /// Deletes multiple knowledge bases by their IDs.
    /// </summary>
    /// <param name="ids">The IDs of the knowledge bases to delete.</param>
    /// <returns>The task result contains the service response indicating whether the knowledge bases were successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteKnowledgeBasesAsync(List<Guid> ids);
}
