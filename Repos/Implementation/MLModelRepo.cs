using MLModelBuilderAPIs.Entities;

namespace MLModelBuilderAPIs.Repos;

public class MLModelRepo : RepositoryBase<MLModel, MLModelBuilderDbContext>, IMLModelRepo
{
    public MLModelRepo(
        MLModelBuilderDbContext mlModelBuilderDbContext): base(mlModelBuilderDbContext)
    {
    }
}