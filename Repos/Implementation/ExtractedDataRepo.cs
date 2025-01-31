namespace MLModelBuilderAPIs.Repos;

public class ExtractedDataRepo : RepositoryBase<ExtractedData, MLModelBuilderDbContext>, IExtractedDataRepo
{
    public ExtractedDataRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}