namespace MLModelBuilderAPIs.Repos;

public class AIProjectVersionApiKeyRepo : RepositoryBase<AIProjectVersionApiKey, MLModelBuilderDbContext>, IAIProjectVersionApiKeyRepo
{
    public AIProjectVersionApiKeyRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}