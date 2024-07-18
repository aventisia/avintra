namespace WorkspaceAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly WorkspaceDbContext _workspaceDbContext;
    public UnitOfWork(
        WorkspaceDbContext workspaceDbContext)
    {
        _workspaceDbContext = workspaceDbContext;
    }

    public IWorkspaceUserRepo WorkspaceUserRepo => new WorkspaceUserRepo(_workspaceDbContext);

    public IProjectRepo ProjectRepo => new ProjectRepo(_workspaceDbContext);

    public INotificationRepo NotificationRepo => new NotificationRepo(_workspaceDbContext);

    public INotificationUserRepo NotificationUserRepo => new NotificationUserRepo(_workspaceDbContext);

    public IFlowRepo FlowRepo => new FlowRepo(_workspaceDbContext);

    public IFlowCommentRepo FlowCommentRepo => new FlowCommentRepo(_workspaceDbContext);

    public async Task<bool> SaveAsync(bool checkHasChanges = false)
    {
        // Check change tracker first 
        if (checkHasChanges)
        {
            return _workspaceDbContext.ChangeTracker.HasChanges()
                ? await _workspaceDbContext.SaveChangesAsync() > 0
                : true;
        }

        // Save changes without checking change tracker
        return await _workspaceDbContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _workspaceDbContext.ChangeTracker.HasChanges();
    }
}
