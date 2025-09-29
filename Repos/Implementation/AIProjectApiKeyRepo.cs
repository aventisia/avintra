namespace MLModelBuilderAPIs.Repos;

public class AIProjectApiKeyRepo : RepositoryBase<AIProjectApiKey, MLModelBuilderDbContext>, IAIProjectApiKeyRepo
{
    public AIProjectApiKeyRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}