namespace MLModelBuilderAPIs.Repos;

public class TableMetadataRepo : RepositoryBase<TableMetadata, MLModelBuilderDbContext>, ITableMetadataRepo
{
    public TableMetadataRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}