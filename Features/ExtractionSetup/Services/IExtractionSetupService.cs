namespace MLModelBuilderAPIs.Services;

public interface IExtractionSetupService
{
    /// <summary>
    /// Retrieves all extraction setups created by the user.
    /// </summary>
    /// <returns>The task result contains the service response with the list of extraction setup details.</returns>
    Task<ServiceResponse<IEnumerable<ExtractionSetupDto>>> RetrieveAllExtractionSetupsAsync();

    /// <summary>
    /// Initializes a new extraction setup for the specified machine learning model.
    /// </summary>
    /// <param name="mlModelId">The ID of the machine learning model to associate with the extraction setup.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> InitializeExtractionSetupAsync(Guid mlModelId);

    /// <summary>
    /// Adds a new extraction setup.
    /// </summary>
    /// <param name="extractionSetupDto">Extraction Setup Dto</param>
    /// <returns>A new extraction setup</returns>
    Task<ServiceResponse<ExtractionSetupDto>> InsertExtractionSetupAsync(ExtractionSetupDto extractionSetupDto);

    /// <summary>
    /// Updates an existing extraction setup.
    /// </summary>
    /// <param name="extractionSetupDto">Extraction Setup Dto</param>
    /// <returns>An updated extraction setup</returns>
    Task<ServiceResponse<ExtractionSetupDto>> UpdateExtractionSetupAsync(ExtractionSetupDto extractionSetupDto);

    /// <summary>
    /// Deletes an extraction setup.
    /// </summary>
    /// <param name="extractionSetupId">Id of the extraction setup to delete</param>
    /// <returns>True if the deletion is successful, else false</returns>
    Task<ServiceResponse<bool>> RemoveExtractionSetupAsync(Guid extractionSetupId);

    /// <summary>
    /// Deletes multiple extraction setups.
    /// </summary>
    /// <param name="extractionSetupIds">A list of extraction setup IDs to delete.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> RemoveMultipleExtractionSetupAsync(IEnumerable<Guid> extractionSetupIds);

    /// <summary>
    /// Retrieves an extraction setup by its identifier.
    /// </summary>
    /// <param name="id">Id of the extraction setup</param>
    /// <returns>An extraction setup with the specific identifier</returns>
    Task<ServiceResponse<ExtractionSetupDto>> RetrieveExtractionSetupByIdAsync(Guid extractionSetupId);

    /// <summary>
    /// Retrieves an extraction setup linked to a specific machine learning model by its model ID.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model associated with the extraction setup.</param>
    /// <returns>A service response containing the extraction setup associated with the provided machine learning model ID.</returns>
    Task<ServiceResponse<ExtractionSetupDto>> GetExtractionSetupByMLModelIdAsync(Guid mlModelId);
}
