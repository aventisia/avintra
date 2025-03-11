namespace MLModelBuilderAPIs.Repos;

public class LLMRepo : RepositoryBase<LLM, MLModelBuilderDbContext>, ILLMRepo
{
    public LLMRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {
    }
}