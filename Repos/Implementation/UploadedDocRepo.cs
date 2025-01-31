namespace MLModelBuilderAPIs.Repos;

public class UploadedDocRepo : RepositoryBase<UploadedDoc, MLModelBuilderDbContext>, IUploadedDocRepo
{
    public UploadedDocRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}