namespace MLModelBuilderAPIs.Repos;

public class AnnotationDataRepo : RepositoryBase<AnnotationData, MLModelBuilderDbContext>, IAnnotationDataRepo
{
    public AnnotationDataRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {
    }

    
}