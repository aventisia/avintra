namespace MLModelBuilderAPIs.Repos;

public class MLModelUserRepo : RepositoryBase<MLModelUser, MLModelBuilderDbContext>, IMLModelUserRepo
{
    public MLModelUserRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}