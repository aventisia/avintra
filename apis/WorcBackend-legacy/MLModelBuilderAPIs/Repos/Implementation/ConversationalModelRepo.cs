namespace MLModelBuilderAPIs.Repos;

public class ConversationalModelRepo : RepositoryBase<ConversationalModel, MLModelBuilderDbContext>, IConversationalModelRepo
{
    public ConversationalModelRepo(MLModelBuilderDbContext mLModelBuilderDbContext): base(mLModelBuilderDbContext)
    {

    }
}