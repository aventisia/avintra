using MLModelBuilderAPIs.Entities;

namespace MLModelBuilderAPIs.Repos;

public interface IMLModelRepo: IRepositoryBase<MLModel, MLModelBuilderDbContext>
{
}