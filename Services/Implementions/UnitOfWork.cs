namespace WorkspaceAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly WorkspaceDbContext _workspaceDbContext;
    private readonly IMapper _mapper;

    public UnitOfWork(
        WorkspaceDbContext workspaceDbContext,
        IMapper mapper)
    {
        _workspaceDbContext = workspaceDbContext;
        _mapper = mapper;
    }

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
