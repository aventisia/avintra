namespace MLModelBuilderAPIs.Repos;

public class ScheduledModelRepo : RepositoryBase<ScheduledModel, MLModelBuilderDbContext>, IScheduledModelRepo
{
    public ScheduledModelRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}