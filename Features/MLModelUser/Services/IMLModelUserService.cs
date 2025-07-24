namespace MLModelBuilderAPIs.Services;

public interface IMLModelUserService
{
    /// <summary>
    /// Retrieves a list of users associated with a specific ML model, identified by the model's Id.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the ML model (Primary Key of MLModel Entity)</param>
    /// <returns>A service response containing a list of users linked to the specified ML model Id</returns>
    Task<ServiceResponse<IEnumerable<MLModelUserDto>>> GetMLModelUsersByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Retrieve a specific ML model user by their unique identifier.
    /// </summary>
    /// <param name="mlModelUserId">The unique identifier of the ML model user</param>
    /// <returns>A service response containing the MLModelUserDto if the user is found, otherwise null</returns>
    Task<ServiceResponse<MLModelUserDto>> GetMLModelUserByIdAsync(Guid mlModelUserId);

    /// <summary>
    /// Adds a new user to an ML model.
    /// </summary>
    /// <param name="mlModelUserDto">The data representing the user to be added to the ML model</param>
    /// <returns>A service response containing the newly added ML model user</returns>
    Task<ServiceResponse<MLModelUserDto>> InsertMLModelUserAsync(MLModelUserDto mlModelUserDto);

    /// <summary>
    /// Assigns one or more users to a machine learning model.
    /// </summary>
    /// <param name="assignMLModelUserDto">The data object containing details of the users to be assigned to the ML model.</param>
    /// <returns>A service response indicating whether the assignment was successful.</returns>
    Task<ServiceResponse<bool>> AssignMLModelUserAsync(AssignMLModelUserDto assignMLModelUserDto);

    /// <summary>
    /// Updates the information of an existing ML model user.
    /// </summary>
    /// <param name="mlModelUserDto">The data of the user to be updated</param>
    /// <returns>A service response containing the updated ML model user</returns>
    Task<ServiceResponse<MLModelUserDto>> UpdateMLModelUserAsync(MLModelUserDto mlModelUserDto);

    /// <summary>
    /// Removes a user from the ML model permanently.
    /// </summary>
    /// <param name="mlModelUserId">The unique identifier of the ML model user to be deleted</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteMLModelUserAsync(Guid mlModelUserId);

    /// <summary>
    /// Removes multiple users from the ML model based on a list of unique identifiers.
    /// </summary>
    /// <param name="mlModelUserIds">A collection of GUIDs representing the ML model users to be removed</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteMultipleMLModelUsersAsync(IEnumerable<Guid> mlModelUserIds);
}
