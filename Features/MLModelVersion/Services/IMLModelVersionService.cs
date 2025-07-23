namespace MLModelBuilderAPIs.Services;

public interface IMLModelVersionService
{
    /// <summary>
    /// Retrieves all ML model versions associated with a specific ML model.
    /// </summary>
    /// <param name="mlModelId">The ID of the ML model.</param>
    /// <returns>A task that returns a service response containing a list of ML model versions.</returns>
    Task<ServiceResponse<IEnumerable<MLModelVersionDto>>> GetModelVersionsByModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Retrieves a specific ML model version by its ID.
    /// </summary>
    /// <param name="mlModelVersionId">The ID of the ml model version to retrieve.</param>
    /// <returns>A service response with the requested ML model version.</returns>
    Task<ServiceResponse<MLModelVersionDto>> GetModelVersionByIdAsync(Guid mlModelVersionId);

    /// <summary>
    /// Creates a new ML model version.
    /// </summary>
    /// <param name="mlModelVersionDto">The DTO containing version details.</param>
    /// <returns>A service response with the newly created ML model version.</returns>
    Task<ServiceResponse<MLModelVersionDto>> CreateModelVersionAsync(MLModelVersionDto mlModelVersionDto);

    /// <summary>
    /// Updates an existing ML model version.
    /// </summary>
    /// <param name="mlModelVersionDto">The DTO containing updated version details.</param>
    /// <returns>A service response with the updated ML model version.</returns>
    Task<ServiceResponse<MLModelVersionDto>> UpdateModelVersionAsync(MLModelVersionDto mlModelVersionDto);

    /// <summary>
    /// Deletes a specific ML model version by its ID.
    /// </summary>
    /// <param name="mlModelVersionId">The ID of the ml model version to delete.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteModelVersionAsync(Guid mlModelVersionId);

    /// <summary>
    /// Deletes multiple ML model versions by their IDs.
    /// </summary>
    /// <param name="mlModelVersionIds">A collection of ml model version IDs to delete.</param>
    /// <returns>A service response indicating whether all deletions were successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleModelVersionsAsync(IEnumerable<Guid> mlModelVersionIds);

    /// <summary>
    /// Publishes a machine learning model version, making it available for use or deployment.
    /// </summary>
    /// <param name="publishMLModelVersionDto">A data transfer object (DTO) containing information required to publish the ML model version.</param>
    /// <returns>A service response containing a boolean value indicating whether the publication was successful.</returns>
    Task<ServiceResponse<bool>> PublishMLModelVersionAsync(PublishMLModelVersionDto publishMLModelVersionDto);
}
