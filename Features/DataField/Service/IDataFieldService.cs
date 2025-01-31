namespace MLModelBuilderAPIs.Services;

public interface IDataFieldService
{
    /// <summary>
    /// Get data fields
    /// </summary>
    /// <param name="mlModelId">ML Model Identifier</param>
    /// <returns>A list of data fields of a specific ML Model Identifier</returns>
    Task<ServiceResponse<IEnumerable<DataFieldDto>>> GetDataFieldsAsync(Guid mlModelId);

    /// <summary>
    /// Creates a data field
    /// </summary>
    /// <param name="dataFieldDto">DataFieldDto</param>
    /// <returns>A newly created data field</returns>
    Task<ServiceResponse<DataFieldDto>> InsertDataFieldAsync(DataFieldDto dataFieldDto);

    /// <summary>
    /// Updates a data field
    /// </summary>
    /// <param name="dataFieldDto">DataFieldDto</param>
    /// <returns>An updated data field</returns>
    Task<ServiceResponse<DataFieldDto>> UpdateDataFieldAsync(DataFieldDto dataFieldDto);

    /// <summary>
    /// Deletes a data field
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteDataFieldAsync(Guid id);

    /// <summary>
    /// Get a data field by identifier
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>A data field with a specific identifier</returns>
    Task<ServiceResponse<DataFieldDto>> GetDataFieldByIdAsync(Guid id);
}