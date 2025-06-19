namespace MLModelBuilderAPIs.Repos;

public class ModelAPIKeyRepo : RepositoryBase<ModelAPIKey, MLModelBuilderDbContext>, IModelAPIKeyRepo
{
    public ModelAPIKeyRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}