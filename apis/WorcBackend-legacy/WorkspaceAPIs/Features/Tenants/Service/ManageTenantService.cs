namespace WorkspaceAPIs.Services;

public class ManageTenantService : IManageTenantService
{
    private readonly ILogger<ManageTenantService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly Guid _userId;
    private readonly Guid _userTenantId;

    public ManageTenantService(
        ILogger<ManageTenantService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        WorkspaceInternalDbContext workspaceInternalDbContext)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;

        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userTenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _workspaceInternalDbContext = workspaceInternalDbContext;
    }

    // Deletes a tenant and all associated data from the database.
    public async Task<ServiceResponse<bool>> DeleteTenantAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tenant records. Please try again later."
        };

        try
        {
            // Check if the user's (requester) tenant ID is the same as the tenant ID to delete If the user tries to delete their own tenant, we prevent it.
            if (_currentTenantService.CurrentTenantId == _userTenantId)
            {
                _logger.LogWarning($"Attempt to delete user's own tenant. TenantId: {_userTenantId}. Operation is not allowed.");
                serviceResponse.Message = "You cannot delete your own tenant.";
                return serviceResponse;
            }

            // Fetch tenant ID from current tenant service (set via passing tenantId in the header), which should be used for deletion
            var tenantIdToBeDeleted = _currentTenantService.CurrentTenantId;

            // Delete VectorStore
            if (!await DeleteEntitiesAsync(_unitOfWork.VectorStoreRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(KeyStore), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete KeyStore
            if (!await DeleteEntitiesAsync(_unitOfWork.KeyStoreRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(KeyStore), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete EncryptedKeyValue - DeleteBehavior.Cascade set with AppSecret

            // Delete AppSecret
            if (!await DeleteEntitiesAsync(_unitOfWork.AppSecretRepo, a => a.TenantId == tenantIdToBeDeleted, nameof(AppSecret), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete Vault
            if (!await DeleteEntitiesAsync(_unitOfWork.VaultRepo, v => v.TenantId == tenantIdToBeDeleted, nameof(Vault), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete Job
            if (!await DeleteEntitiesAsync(_unitOfWork.JobRepo, j => j.TenantId == tenantIdToBeDeleted, nameof(Job), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete TimeTriggerFlowVersion - DeleteBehavior.Cascade set with TimeTrigger

            // Delete TimeTrigger
            if (!await DeleteEntitiesAsync(_unitOfWork.TriggerRepo, t => t.TenantId == tenantIdToBeDeleted, nameof(TimeTrigger), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete WorkItemEvent - DeleteBehavior.Cascade set with QueueTransaction
            // Delete QueueTransaction - DeleteBehavior.Cascade set with Queue
            // Delete QueueFlowVersion - DeleteBehavior.Cascade set with Queue
            // Delete QueueUser - DeleteBehavior.Cascade set with Queue

            // Delete Queue
            if (!await DeleteEntitiesAsync(_unitOfWork.QueueRepo, q => q.TenantId == tenantIdToBeDeleted, nameof(Queue), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete Machine_FlowVersion - DeleteBehavior.Cascade set with Machine

            // Delete Machine
            if (!await DeleteEntitiesAsync(_unitOfWork.MachineRepo, m => m.TenantId == tenantIdToBeDeleted, nameof(Machine), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete FlowVersion
            if (!await DeleteEntitiesAsync(_unitOfWork.FlowVersionRepo, f => f.TenantId == tenantIdToBeDeleted, nameof(FlowVersion), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete FlowComment - DeleteBehavior.Cascade set with Flow
            // Delete FlowLog - DeleteBehavior.Cascade set with FlowVersion (TODO: should be with FlowVersion currently its with Flow)
            // Delete FlowVersion - DeleteBehavior.Cascade set with Flow
            // Delete FlowUser - DeleteBehavior.Cascade set with Flow

            // Delete Flow
            if (!await DeleteEntitiesAsync(_unitOfWork.FlowRepo, f => f.TenantId == tenantIdToBeDeleted, nameof(Flow), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete SupportTicketRemark - DeleteBehavior.Cascade set with SupportTicket

            // Delete SupportTicket
            if (!await DeleteEntitiesAsync(_unitOfWork.SupportTicketRepo, s => s.TenantId == tenantIdToBeDeleted, nameof(SupportTicket), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete NotificationUser - DeleteBehavior.Cascade set with Notification

            // Delete Notification
            if (!await DeleteEntitiesAsync(_unitOfWork.NotificationRepo, n => n.TenantId == tenantIdToBeDeleted, nameof(Notification), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete TemplateResource - DeleteBehavior.Cascade set with ProjectTemplate

            // Delete ProjectTemplate
            if (!await DeleteEntitiesAsync(_unitOfWork.ProjectTemplateRepo, p => p.TenantId == tenantIdToBeDeleted, nameof(ProjectTemplate), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete OnPremModel
            if (!await DeleteEntitiesAsync(_unitOfWork.OnPremModelRepo, o => o.TenantId == tenantIdToBeDeleted, nameof(OnPremModel), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete WorkspaceUser
            if (!await DeleteEntitiesAsync(_unitOfWork.WorkspaceUserRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(WorkspaceUser), tenantIdToBeDeleted))
                return serviceResponse;

            // If deletion is successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant and associated data have been deleted successfully.";
        }
        catch (Exception ex)
        {
            // Log error and return failure
            _logger.LogError(ex, "Error occurred while attempting to delete tenant with ID {TenantId}", _currentTenantService.CurrentTenantId);
        }

        // Return service response
        return serviceResponse;
    }

    // Helper: To delete entities with a common pattern
    private async Task<bool> DeleteEntitiesAsync<TEntity>(
        IRepositoryBase<TEntity, WorkspaceDbContext> repository,
        Expression<Func<TEntity, bool>> condition,
        string entityName,
        Guid tenantId) where TEntity : class
    {
        // Get entities based on the provided condition
        var entities = await repository.GetByConditionAsync(condition).ToListAsync();

        // Nothing to delete
        if (!entities.Any())
            return true;

        // Delete entities and log the operation
        _logger.LogInformation($"Deleting {entities.Count} {entityName} records for tenant ID: {tenantId}");
        repository.Delete(entities);

        // Save changes and check for success
        if (!await _unitOfWork.SaveAsync())
        {
            _logger.LogError($"Context SaveChanges failed while deleting {entityName} records.");
            return false;
        }

        return true;
    }

    // Retrieves aggregated job metrics (execution time + published agents count) grouped by TenantId
    public async Task<ServiceResponse<IEnumerable<TenantTableSummaryDto>>> GetTenantJobSummaryAsync(DateTimeOffset? startDate, DateTimeOffset? endDate)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<IEnumerable<TenantTableSummaryDto>>
        {
            Data = null,
            Message = "Failed to retrieve tenant job summary. Please try again later."
        };

        try
        {
            // If no date range is provided, default to last 1 month (UTC)
            if (!startDate.HasValue || !endDate.HasValue)
            {
                startDate = DateTime.UtcNow.Date.AddMonths(-1);
                endDate = DateTime.UtcNow.Date;
            }

            // Fetch and aggregate job execution time per tenant
            var tenantExecutionData = await _workspaceInternalDbContext.Jobs
                .Where(w =>
                    w.EndTime != null &&
                    w.CreatedOn >= startDate &&
                    w.CreatedOn < endDate
                )
                .GroupBy(g => g.TenantId)
                .Select(s => new
                {
                    TenantId = s.Key,
                    TotalJobs = s.Count(),
                    ExecutionTime = s.Sum(sm =>
                        sm.EndTime != null && sm.StartTime != null
                            ? (sm.EndTime.Value - sm.StartTime.Value).TotalSeconds
                            : 0
                    )
                })
                .ToListAsync();

            // Fetch and count published agents per tenant
            var tenantPublishAgentData = await _workspaceInternalDbContext.FlowVersions
                .Where(w =>
                    w.IsPublished &&
                    w.LastModifiedOn >= startDate &&
                    w.LastModifiedOn < endDate
                )
                .GroupBy(g => g.TenantId)
                .Select(s => new
                {
                    TenantId = s.Key,
                    PublishAgentCount = s.Count()
                })
                .ToListAsync();

            // Build unified tenant list (union of both datasets)
            // NOTE: Only includes tenants with activity
            var executionTenantIds = tenantExecutionData.Select(x => x.TenantId);
            var publishTenantIds = tenantPublishAgentData.Select(x => x.TenantId);

            var tenantIds = executionTenantIds
                .Concat(publishTenantIds)
                .Distinct()
                .ToList();

            // Merge execution data with published agent counts
            var tenantSummaries = tenantIds
                .Select(tenantId =>
                {
                    var execution = tenantExecutionData
                        .FirstOrDefault(x => x.TenantId == tenantId);

                    var published = tenantPublishAgentData
                        .FirstOrDefault(x => x.TenantId == tenantId);

                    return new TenantTableSummaryDto
                    {
                        TenantId = tenantId,
                        TotalJobs = execution?.TotalJobs ?? 0,
                        ExecutionTime = execution?.ExecutionTime ?? 0,
                        PublishAgent = published?.PublishAgentCount ?? 0
                    };
                })
                .ToList();

            // Populate success response
            serviceResponse.Data = tenantSummaries;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant job summary retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError("Error retrieving tenant job summary: {ErrorDetails}", ex.ToString());
        }

        return serviceResponse;
    }
}
