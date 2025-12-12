namespace AccountsAPIs.Repos;

public class AITaskRepo : RepositoryBase<AITask, AccountsDbContext>, IAITaskRepo
{
    public AITaskRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}