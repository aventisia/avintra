namespace MLModelBuilderAPIs.Services;

public interface IUploadedDocService
{
    /// <summary>
    /// Get a list of uploaded docs
    /// </summary>
    /// <param name="mlModelId">ML Model Id</param>
    /// <returns>A list of uploaded dpcs</returns>
    Task<ServiceResponse<IEnumerable<UploadedDocDto>>> GetUploadedDocListAsync(Guid mlModelId);

    /// <summary>
    /// Inserts a doc
    /// </summary>
    /// <param name="docList">List of documents</param>
    /// <returns>A new doc</returns>
    Task<ServiceResponse<IEnumerable<UploadedDocDto>>> InsertUploadedDocsAsync(IEnumerable<UploadedDocDto> docList);
}