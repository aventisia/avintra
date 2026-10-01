namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing skill registry entries.
/// </summary>
public interface ISkillRegistryService
{
    /// <summary>
    /// Retrieves all skills visible to the current user (personal and shared).
    /// </summary>
    /// <returns>The task result contains the service response with the list of skill details.</returns>
    Task<ServiceResponse<IEnumerable<SkillDto>>> GetSkillsAsync();

    /// <summary>
    /// Checks whether a skill name is available within the current tenant.
    /// </summary>
    /// <param name="skillId">Optional skill ID to exclude from the check when updating an existing skill.</param>
    /// <param name="checkAvailabilityDto">The DTO containing the skill name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains availability result.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsSkillNameAvailableAsync(Guid? skillId, CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves a skill by its ID.
    /// </summary>
    /// <param name="skillId">The ID of the skill.</param>
    /// <returns>The task result contains the service response with the skill details.</returns>
    Task<ServiceResponse<SkillDto>> GetSkillByIdAsync(Guid skillId);

    /// <summary>
    /// Retrieves a skill by its name within the current environment and tenant.
    /// </summary>
    /// <param name="skillName">The name of the skill to retrieve.</param>
    /// <returns>The task result contains the service response with the skill details.</returns>
    Task<ServiceResponse<SkillDto>> GetSkillByNameAsync(string skillName);

    /// <summary>
    /// Inserts a new skill.
    /// </summary>
    /// <param name="skillDto">The data required to insert the skill.</param>
    /// <returns>The task result contains the service response with the inserted skill details.</returns>
    Task<ServiceResponse<SkillDto>> InsertSkillAsync(SkillDto skillDto);

    /// <summary>
    /// Updates an existing skill.
    /// </summary>
    /// <param name="skillDto">The data required to update the skill.</param>
    /// <returns>The task result contains the service response with the updated skill details.</returns>
    Task<ServiceResponse<SkillDto>> UpdateSkillAsync(SkillDto skillDto);

    /// <summary>
    /// Deletes a skill by its ID.
    /// </summary>
    /// <param name="skillId">The ID of the skill to delete.</param>
    /// <returns>The task result contains the service response indicating whether the skill was deleted.</returns>
    Task<ServiceResponse<bool>> DeleteSkillAsync(Guid skillId);

    /// <summary>
    /// Deletes multiple skills by their IDs.
    /// </summary>
    /// <param name="skillIds">The IDs of the skills to delete.</param>
    /// <returns>The task result contains the service response indicating whether the skills were deleted.</returns>
    Task<ServiceResponse<bool>> DeleteSkillsAsync(List<Guid> skillIds);

    /// <summary>
    /// Retrieves all skills accessible to the specified user for desktop sync.
    /// </summary>
    /// <returns>The task result contains the service response with the list of skills and their files.</returns>
    Task<ServiceResponse<IEnumerable<SkillSyncDto>>> GetSkillsForSyncAsync();

    /// <summary>
    /// Retrieves all platform (library) skills available to the current tenant.
    /// </summary>
    /// <returns>The task result contains the service response with the list of library skill details.</returns>
    Task<ServiceResponse<IEnumerable<SkillDto>>> GetLibrarySkillsAsync();

    /// <summary>
    /// Retrieves skills accessible to the current user in selectable option format.
    /// </summary>
    /// <returns>The task result contains the service response with selectable skill options.</returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableSkillOptionsAsync();
}
