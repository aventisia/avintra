namespace MLModelBuilderAPIs.Services;

public interface IExtractionSetupService
{
    /// <summary>
    /// Retrieves all extraction setups created by the user.
    /// </summary>
    /// <returns>The task result contains the service response with the list of extraction setup details.</returns>
    Task<ServiceResponse<IEnumerable<ExtractionSetupDto>>> RetrieveAllExtractionSetupsAsync();

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
}
