namespace MLModelBuilderAPIs.Repos;

public class ExtractionSetupRepo : RepositoryBase<ExtractionSetup, MLModelBuilderDbContext>, IExtractionSetupRepo
{
    public ExtractionSetupRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}