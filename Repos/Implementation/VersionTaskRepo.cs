namespace MLModelBuilderAPIs.Repos;

public class VersionTaskRepo : RepositoryBase<VersionTask, MLModelBuilderDbContext>, IVersionTaskRepo
{
    public VersionTaskRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}