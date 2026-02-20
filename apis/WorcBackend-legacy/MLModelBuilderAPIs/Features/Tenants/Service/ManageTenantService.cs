namespace MLModelBuilderAPIs.Services;

public class ManageTenantService : IManageTenantService
{
    private readonly ILogger<ManageTenantService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;
    private readonly Guid _userTenantId;

    public ManageTenantService(
        ILogger<ManageTenantService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;

        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userTenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
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

            
            
            // Delete MLModelTemplate
            if (!await DeleteEntitiesAsync(_unitOfWork.MLModelTemplateRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(MLModelTemplate), tenantIdToBeDeleted))
                return serviceResponse;
            
            // Delete ConversationHistory
            if (!await DeleteEntitiesAsync(_unitOfWork.ConversationHistoryRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(ConversationHistory), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete ConversationalModel
            if (!await DeleteEntitiesAsync(_unitOfWork.ConversationalModelRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(ConversationalModel), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete GenerativeModel
            if (!await DeleteEntitiesAsync(_unitOfWork.GenerativeModelRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(GenerativeModel), tenantIdToBeDeleted))
                return serviceResponse;
            
            // Delete AIProjectVersionApiKey
            if (!await DeleteEntitiesAsync(_unitOfWork.AIProjectVersionApiKeyRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(AIProjectVersionApiKey), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete FineTuningLog - DeleteBehavior.Cascade set with ScheduledModel
            // Delete ScheduledModel - DeleteBehavior.Cascade set with ExtractedData

            // Delete ExtractedData
            if (!await DeleteEntitiesAsync(_unitOfWork.ExtractedDataRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(ExtractedData), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete VersionTask
            if (!await DeleteEntitiesAsync(_unitOfWork.VersionTaskRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(VersionTask), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete VersionResource - DeleteBehavior.Cascade set with AIProjectVersion

            // Delete AIProjectVersion
            if (!await DeleteEntitiesAsync(_unitOfWork.AIProjectVersionRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(AIProjectVersion), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete AIProject_User - DeleteBehavior.Cascade set with AIProject

            // Delete AIProject
            if (!await DeleteEntitiesAsync(_unitOfWork.AIProjectRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(AIProject), tenantIdToBeDeleted))
                return serviceResponse;

            // Delete ModelBuilderUser
            if (!await DeleteEntitiesAsync(_unitOfWork.ModelBuilderUserRepo, w => w.TenantId == tenantIdToBeDeleted, nameof(ModelBuilderUser), tenantIdToBeDeleted))
                return serviceResponse;

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant and associated data have been deleted successfully.";
        }
        catch (Exception ex)
        {
            // Log an error if the deletion operation fails
            _logger.LogError(ex, "Error occurred while attempting to delete tenant with ID {TenantId}", _currentTenantService.CurrentTenantId);
        }

        // Return the response indicating success or failure
        return serviceResponse;
    }

    // Helper: To delete entities with a common pattern
    private async Task<bool> DeleteEntitiesAsync<TEntity>(
        IRepositoryBase<TEntity, MLModelBuilderDbContext> repository,
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
}