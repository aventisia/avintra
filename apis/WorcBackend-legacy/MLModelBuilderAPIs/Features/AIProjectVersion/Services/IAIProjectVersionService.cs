namespace MLModelBuilderAPIs.Services;

public interface IAIProjectVersionService
{
    /// <summary>
    /// Retrieves all AI project versions associated with a specific AI project.
    /// </summary>
    /// <param name="aiProjectId">The ID of the AI project.</param>
    /// <returns>A task that returns a service response containing a list of AI project versions.</returns>
    Task<ServiceResponse<IEnumerable<AIProjectVersionDto>>> GetAIProjectVersionsByProjectIdAsync(Guid aiProjectId);

    /// <summary>
    /// Retrieves a specific AI project version by its ID.
    /// </summary>
    /// <param name="aiProjectVersionId">The ID of the AI project version to retrieve.</param>
    /// <returns>A service response with the requested AI project version.</returns>
    Task<ServiceResponse<AIProjectVersionDto>> GetAIProjectVersionByIdAsync(Guid aiProjectVersionId);

    /// <summary>
    /// Creates a new AI project version.
    /// </summary>
    /// <param name="aiProjectVersionDto">The DTO containing version details.</param>
    /// <returns>A service response with the newly created AI project version.</returns>
    Task<ServiceResponse<AIProjectVersionDto>> CreateAIProjectVersionAsync(AIProjectVersionDto aiProjectVersionDto);

    /// <summary>
    /// Updates an existing AI project version.
    /// </summary>
    /// <param name="aiProjectVersionDto">The DTO containing updated version details.</param>
    /// <returns>A service response with the updated AI project version.</returns>
    Task<ServiceResponse<AIProjectVersionDto>> UpdateAIProjectVersionAsync(AIProjectVersionDto aiProjectVersionDto);

    /// <summary>
    /// Deletes a specific AI project version by its ID.
    /// </summary>
    /// <param name="aiProjectVersionId">The ID of the AI project version to delete.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteAIProjectVersionAsync(Guid aiProjectVersionId);

    /// <summary>
    /// Deletes multiple AI project versions by their IDs.
    /// </summary>
    /// <param name="aiProjectVersionIds">A collection of AI project version IDs to delete.</param>
    /// <returns>A service response indicating whether all deletions were successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleAIProjectVersionsAsync(IEnumerable<Guid> aiProjectVersionIds);

    /// <summary>
    /// Publishes an AI project version, making it available for use or deployment.
    /// </summary>
    /// <param name="publishAIProjectVersionDto">A data transfer object (DTO) containing information required to publish the AI project version.</param>
    /// <returns>A service response containing a boolean value indicating whether the publication was successful.</returns>
    Task<ServiceResponse<bool>> PublishAIProjectVersionAsync(PublishAIProjectVersionDto publishAIProjectVersionDto);
}