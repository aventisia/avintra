namespace MLModelBuilderAPIs.Services;

public interface IExtractedDataService
{
    /// <summary>
    /// Get list of extracted data
    /// </summary>
    /// <param name="mlModelId">Model Library identifier</param>
    /// <param name="type">Extracted data type</param>
    /// <returns>A list og extracted data with specific model identifier and extracted data type</returns>
    Task<ServiceResponse<IEnumerable<ExtractedDataDto>>> GetExtractedDataListAsync(Guid mlModelId, ExtractedDataType type);

    /// <summary>
    /// Inserts an extracted data
    /// </summary>
    /// <param name="extractedDataDto">Extracted Data Dto</param>
    /// <returns>A new extracted data record</returns>
    Task<ServiceResponse<ExtractedDataDto>> InsertExtractedDataAsync(ExtractedDataDto extractedDataDto);

    /// <summary>
    /// Updates an extracted data
    /// </summary>
    /// <param name="extractedDataDto">Extracted Data Dto</param>
    /// <returns>An update extracted data record</returns>
    Task<ServiceResponse<ExtractedDataDto>> UpdateExtractedDataAsync(ExtractedDataDto extractedDataDto);

    /// <summary>
    /// Deletes an extracted data 
    /// </summary>
    /// <param name="id">Identifier</param>
    /// <returns>True if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteExtractedDataAsync(Guid id);

    /// <summary>
    /// Get extracted data by an identifier
    /// </summary>
    /// <param name="id">Identifier</param>
    /// <returns>An existing data of a specific identifier</returns>
    Task<ServiceResponse<ExtractedDataDto>> GetExtractedDataByIdAsync(Guid id);

    /// <summary>
    /// Update extracted data silently in the background whenever the user makes any changes.
    /// </summary>
    /// <param name="extractedDataSilentUpdateDataDto">The DTO containing the updated information for the extracted data.</param>
    /// <returns>A task representing the asynchronous operation, with a service response indicating the success or failure of the update.</returns>
    Task<ServiceResponse<bool>> UpdateExtractedDataSilentlyAsync(ExtractedDataSilentUpdateDataDto extractedDataSilentUpdateDataDto);

    /// <summary>
    /// Deletes multiple extracted data entries based on the provided list of IDs.
    /// </summary>
    /// <param name="ids">List of IDs for the extracted data to be deleted.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleExtractedDataAsync([FromBody] List<Guid> ids);
}