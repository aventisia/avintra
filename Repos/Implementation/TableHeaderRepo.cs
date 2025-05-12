namespace MLModelBuilderAPIs.Repos;

public class TableHeaderRepo : RepositoryBase<TableHeader, MLModelBuilderDbContext>, ITableHeaderRepo
{
    public TableHeaderRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}