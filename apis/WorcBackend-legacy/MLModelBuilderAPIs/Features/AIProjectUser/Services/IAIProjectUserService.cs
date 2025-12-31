namespace MLModelBuilderAPIs.Services;

public interface IAIProjectUserService
{
    /// <summary>
    /// Retrieves a list of users associated with a specific AI project, identified by the project's Id.
    /// </summary>
    /// <param name="aiProjectId">The unique identifier of the AI project (Primary Key of AIProject Entity)</param>
    /// <returns>A service response containing a list of users linked to the specified AI project Id</returns>
    Task<ServiceResponse<IEnumerable<AIProjectUserDto>>> GetAIProjectUsersByAIProjectIdAsync(Guid aiProjectId);

    /// <summary>
    /// Retrieve a specific AI project user by their unique identifier.
    /// </summary>
    /// <param name="aiProjectUserId">The unique identifier of the AI project user</param>
    /// <returns>A service response containing the AIProjectUserDto if the user is found, otherwise null</returns>
    Task<ServiceResponse<AIProjectUserDto>> GetAIProjectUserByIdAsync(Guid aiProjectUserId);

    /// <summary>
    /// Adds a new user to an AI project.
    /// </summary>
    /// <param name="aiProjectUserDto">The data representing the user to be added to the AI project</param>
    /// <returns>A service response containing the newly added AI project user</returns>
    Task<ServiceResponse<AIProjectUserDto>> InsertAIProjectUserAsync(AIProjectUserDto aiProjectUserDto);

    /// <summary>
    /// Assigns one or more users to an AI project.
    /// </summary>
    /// <param name="assignAIProjectUserDto">The data object containing details of the users to be assigned to the AI project.</param>
    /// <returns>A service response indicating whether the assignment was successful.</returns>
    Task<ServiceResponse<bool>> AssignAIProjectUserAsync(AssignAIProjectUserDto assignAIProjectUserDto);

    /// <summary>
    /// Updates the information of an existing AI project user.
    /// </summary>
    /// <param name="aiProjectUserDto">The data of the user to be updated</param>
    /// <returns>A service response containing the updated AI project user</returns>
    Task<ServiceResponse<AIProjectUserDto>> UpdateAIProjectUserAsync(AIProjectUserDto aiProjectUserDto);

    /// <summary>
    /// Removes a user from the AI project permanently.
    /// </summary>
    /// <param name="aiProjectUserId">The unique identifier of the AI project user to be deleted</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteAIProjectUserAsync(Guid aiProjectUserId);

    /// <summary>
    /// Removes multiple users from the AI project based on a list of unique identifiers.
    /// </summary>
    /// <param name="aiProjectUserIds">A collection of GUIDs representing the AI project users to be removed</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteMultipleAIProjectUsersAsync(IEnumerable<Guid> aiProjectUserIds);
}
