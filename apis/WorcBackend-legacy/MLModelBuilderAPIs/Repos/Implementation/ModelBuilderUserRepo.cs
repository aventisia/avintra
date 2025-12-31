namespace MLModelBuilderAPIs.Repos;

public class ModelBuilderUserRepo : RepositoryBase<ModelBuilderUser, MLModelBuilderDbContext>, IModelBuilderUserRepo
{
    public ModelBuilderUserRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {
    }
}