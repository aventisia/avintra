namespace MLModelBuilderAPIs.Repos;

public class MLModelTemplateRepo : RepositoryBase<MLModelTemplate, MLModelBuilderDbContext>, IMLModelTemplateRepo
{
    public MLModelTemplateRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}