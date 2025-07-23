namespace MLModelBuilderAPIs.Repos;

public class MLModelVersionRepo : RepositoryBase<MLModelVersion, MLModelBuilderDbContext>, IMLModelVersionRepo
{
    public MLModelVersionRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}