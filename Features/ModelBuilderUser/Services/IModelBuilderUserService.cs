using MLModelBuilderAPIs.DTOs;

namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Represents a service for managing model builder users.
/// </summary>
public interface IModelBuilderUserService
{
    /// <summary>
    /// Retrieves a model builder user by its ID.
    /// </summary>
    /// <param name="id">The ID of the model builder user.</param>
    /// <returns>The task result contains the retrieved model builder user.</returns>
    Task<ServiceResponse<ModelBuilderUserDto>> GetModelBuilderUserAsync(Guid id);

    /// <summary>
    /// Insert new model builder record if does not exist already
    /// </summary>
    /// <param name="modelBuilderUserDto">The data for the new model builder user.</param>
    /// <returns>The task result contains the inserted model builder user.</returns>
    Task<ServiceResponse<ModelBuilderUserDto>> InsertModelBuilderUserAsync(ModelBuilderUserDto modelBuilderUserDto);

    /// <summary>
    /// Updates an existing model builder user.
    /// </summary>
    /// <param name="modelBuilderUserDto">The updated data for the workspace user.</param>
    /// <returns>The task result contains the updated workspace user.</returns>
    Task<ServiceResponse<ModelBuilderUserDto>> UpdateModelBuilderUserAsync(ModelBuilderUserDto modelBuilderUserDto);

    /// <summary>
    /// Deletes a workspace user by its ID.
    /// </summary>
    /// <param name="id">The ID of the workspace user to delete.</param>
    /// <returns>The task result contains a boolean indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteModelBuilderUserAsync(Guid id);
}
