using WorkspaceAPIs.Entities;

namespace WorkspaceAPIs.Repos;

public class AgentRiskRegistryRepo : RepositoryBase<AgentRiskRegistry, WorkspaceDbContext>, IAgentRiskRegistryRepo
{
    public AgentRiskRegistryRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
