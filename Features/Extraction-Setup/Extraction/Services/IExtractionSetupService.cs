namespace MLModelBuilderAPIs.Services;

public interface IExtractionSetupService
{
    /// <summary>
    /// Updates an existing extraction setup associated with a machine learning model.
    /// This operation modifies the setup configuration based on the provided details in the 
    /// <paramref name="mlModelSetupDto"/> and returns the updated extraction setup.
    /// </summary>
    /// <param name="mlModelSetupDto">The updated extraction setup data transfer object (DTO) containing the new setup details.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response with the updated extraction setup details.</returns>
    Task<ServiceResponse<MLModelSetupDto>> UpdateExtractionSetupAsync(MLModelSetupDto mlModelSetupDto);

    /// <summary>
    /// Retrieves an extraction setup linked to a specific machine learning model by its model ID.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model associated with the extraction setup.</param>
    /// <returns>A service response containing the extraction setup associated with the provided machine learning model ID.</returns>
    Task<ServiceResponse<MLModelSetupDto>> GetExtractionSetupByMLModelIdAsync(Guid mlModelId);
}
