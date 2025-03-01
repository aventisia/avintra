namespace MLModelBuilderAPIs.Repos;

public class UploadedDocRepo : RepositoryBase<UploadedDoc, MLModelBuilderDbContext>, IUploadedDocRepo
{
    public UploadedDocRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
    public async Task<int> GetUploadDocsCountAsync(Guid mlModelId)
    {
        return await _tDbContext.UploadedDocs.Where(ud => ud.MLModelId ==mlModelId).CountAsync();
    }
}