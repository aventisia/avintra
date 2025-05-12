namespace MLModelBuilderAPIs.Repos;

public class FieldSetupRepo : RepositoryBase<FieldSetup, MLModelBuilderDbContext>, IFieldSetupRepo
{
    public FieldSetupRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}