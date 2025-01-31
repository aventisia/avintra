namespace MLModelBuilderAPIs.Repos;

public class DataFieldRepo : RepositoryBase<DataField, MLModelBuilderDbContext>, IDataFieldRepo
{
    public DataFieldRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}