namespace MLModelBuilderAPIs.Repos;

public class GenerativeModelRepo : RepositoryBase<GenerativeModel, MLModelBuilderDbContext>, IGenerativeModelRepo
{
    public GenerativeModelRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}