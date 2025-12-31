namespace MLModelBuilderAPIs.Repos;

public class AIProjectUserRepo : RepositoryBase<AIProject_User, MLModelBuilderDbContext>, IAIProjectUserRepo
{
    public AIProjectUserRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}