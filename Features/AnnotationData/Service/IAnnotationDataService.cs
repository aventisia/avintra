namespace  MLModelBuilderAPIs.Services;

public interface IAnnotationDataService
{
    /// <summary>
    /// Retrives list of annotation data
    /// </summary>
    /// <param name="mlModelId">ML Model Identifier</param>
    /// <returns>List of annotation data of a specific ML model </returns>
    Task<ServiceResponse<IEnumerable<AnnotationDataDto>>> GetAnnotationDataListAsync(Guid mlModelId);

    /// <summary>
    /// Inserts an annotation data
    /// </summary>
    /// <param name="annotationDataDto">Annotation Data Dto Model</param>
    /// <returns></returns>
    Task<ServiceResponse<AnnotationDataDto>> InsertAnnotationDataAsync(AnnotationDataDto annotationDataDto);

    /// <summary>
    /// Updates an annotation data
    /// </summary>
    /// <param name="annotationDataDto">Annotation Data Dto Mode</param>
    /// <returns>An updated annotation data</returns>
    Task<ServiceResponse<AnnotationDataDto>> UpdateAnnotationDataAsync(AnnotationDataDto annotationDataDto);

    /// <summary>
    /// Deletes an annotation data
    /// </summary>
    /// <param name="id">Record identifier</param>
    /// <returns>True if the delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteAnnotationDataAsync(Guid id);

    /// <summary>
    /// Get annotation data by an identifier
    /// </summary>
    /// <param name="id">Identifier</param>
    /// <returns>Annotation data of a specific identifier</returns>
    Task<ServiceResponse<AnnotationDataDto>> GetAnnotationDataByIdAsync(Guid id);

}