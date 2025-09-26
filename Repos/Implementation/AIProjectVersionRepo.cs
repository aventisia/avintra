namespace MLModelBuilderAPIs.Repos;

public class AIProjectVersionRepo : RepositoryBase<AIProjectVersion, MLModelBuilderDbContext>, IAIProjectVersionRepo
{
    public AIProjectVersionRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}