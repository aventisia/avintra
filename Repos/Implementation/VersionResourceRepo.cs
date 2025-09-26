namespace MLModelBuilderAPIs.Repos;

public class VersionResourceRepo : RepositoryBase<VersionResource, MLModelBuilderDbContext>, IVersionResourceRepo
{
    public VersionResourceRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}