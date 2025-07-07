namespace MLModelBuilderAPIs.Repos;

public class ModelTaskRepo : RepositoryBase<ModelTask, MLModelBuilderDbContext>, IModelTaskRepo
{
    public ModelTaskRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}