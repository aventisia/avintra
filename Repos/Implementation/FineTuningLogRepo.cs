namespace MLModelBuilderAPIs.Repos;

public class FineTuningLogRepo : RepositoryBase<FineTuningLog, MLModelBuilderDbContext>, IFineTuningLogRepo
{
    public FineTuningLogRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}