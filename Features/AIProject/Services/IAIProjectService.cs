namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Defines the contract for managing AI projects.
/// </summary>
public interface IAIProjectService
{
    /// <summary>
    /// Retrieves all AI projects created by the authenticated user.
    /// </summary>
    /// <returns>A service response containing the list of AI project DTOs.</returns>
    Task<ServiceResponse<IEnumerable<AIProjectDto>>> GetAIProjectListAsync();

    /// <summary>
    /// Checks if a given AI project name is available (not already used).
    /// </summary>
    /// <param name="checkAvailabilityDto">DTO containing the project name to check.</param>
    /// <returns>A service response indicating whether the name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsAIProjectNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Inserts a new AI project into the system.
    /// </summary>
    /// <param name="aiProjectDto">DTO containing the new AI project data.</param>
    /// <returns>A service response with the created AI project DTO.</returns>
    Task<ServiceResponse<AIProjectDto>> InsertAIProjectAsync(AIProjectDto aiProjectDto);

    /// <summary>
    /// Updates an existing AI project.
    /// </summary>
    /// <param name="aiProjectDto">DTO containing the updated AI project data.</param>
    /// <returns>A service response with the updated AI project DTO.</returns>
    Task<ServiceResponse<AIProjectDto>> UpdateAIProjectAsync(AIProjectDto aiProjectDto);

    /// <summary>
    /// Deletes a specific AI project by its ID.
    /// </summary>
    /// <param name="aiProjectId">The unique identifier of the AI project.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteAIProjectAsync(Guid aiProjectId);

    /// <summary>
    /// Deletes multiple AI projects based on a collection of IDs.
    /// </summary>
    /// <param name="aiProjectIds">A list of AI project IDs to delete.</param>
    /// <returns>A service response indicating whether the bulk deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleAIProjectsAsync(IEnumerable<Guid> aiProjectIds);

    /// <summary>
    /// Retrieves a specific AI project by its ID.
    /// </summary>
    /// <param name="aiProjectId">The unique identifier of the AI project.</param>
    /// <returns>A service response containing the requested AI project DTO.</returns>
    Task<ServiceResponse<AIProjectDto>> GetAIProjectByIdAsync(Guid aiProjectId);
}
