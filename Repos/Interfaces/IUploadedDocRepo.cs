namespace MLModelBuilderAPIs.Repos;

public interface IUploadedDocRepo: IRepositoryBase<UploadedDoc, MLModelBuilderDbContext>
{
    /// <summary>
    /// Get upload docs count
    /// </summary>
    /// <param name="mlModelId"></param>
    /// <returns></returns>
    Task<int> GetUploadDocsCountAsync(Guid mlModelId);
}