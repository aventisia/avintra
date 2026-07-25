namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing Knowledge Bases.
/// </summary>
public interface IKnowledgeBaseService
{
    /// <summary>
    /// Retrieves all knowledge bases.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal knowledge bases. If <c>false</c>, returns only shared knowledge bases. </param>
    /// <returns>The task result contains the service response with the list of knowledge base details.</returns>
    Task<ServiceResponse<IEnumerable<KnowledgeBaseDto>>> GetKnowledgeBasesAsync(bool isPersonal);

    /// <summary>
    /// Retrieves knowledge bases for the current user in selectable option format.
    /// </summary>
    /// <returns>The task result contains the service response with selectable knowledge base options.</returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableKnowledgeBaseOptionsAsync();

    /// <summary>
    /// Checks the availability of a knowledge base name for the current user.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the knowledge base name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsKnowledgeBaseNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves a knowledge base by its name.
    /// </summary>
    /// <param name="knowledgeBaseName">The name of the knowledge base.</param>
    /// <returns>
    /// The task result contains the service response with the knowledge base details.
    /// </returns>
    Task<ServiceResponse<KnowledgeBaseDto>> GetKnowledgeBaseByNameAsync(string knowledgeBaseName);

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
