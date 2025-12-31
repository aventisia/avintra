namespace MLModelBuilderAPIs.Repos;

public class ConversationHistoryRepo : RepositoryBase<ConversationHistory, MLModelBuilderDbContext>, IConversationHistoryRepo
{
    public ConversationHistoryRepo(MLModelBuilderDbContext mLModelBuilderDbContext) : base(mLModelBuilderDbContext)
    {

    }
}