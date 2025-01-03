using Microsoft.Graph.Models;

namespace WorkspaceAPIs.Repos;

public class SubscriptionRepo : RepositoryBase<WorkspaceAPIs.Entities.Subscription, WorkspaceDbContext>, ISubscriptionRepo
{
    public SubscriptionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}