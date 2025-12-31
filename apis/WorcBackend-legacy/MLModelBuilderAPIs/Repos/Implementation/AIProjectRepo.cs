namespace MLModelBuilderAPIs.Repos;

public class AIProjectRepo : RepositoryBase<AIProject, MLModelBuilderDbContext>, IAIProjectRepo
{
    public AIProjectRepo(
        MLModelBuilderDbContext mlModelBuilderDbContext): base(mlModelBuilderDbContext)
    {
    }
}