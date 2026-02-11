namespace MLModelBuilderAPIs.Services;

public class ManageTenantService : IManageTenantService
{
    private readonly ILogger<ManageTenantService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

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
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
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
            // Check if the current tenant ID is the same as the tenant ID to delete If the tenant tries to delete itself, we prevent it.
            if (_currentTenantService.CurrentTenantId == _tenantId)
            {
                _logger.LogWarning($"Attempt to delete current tenant. TenantId: {_tenantId}. Operation is not allowed.");
                serviceResponse.Message = "You cannot delete your own tenant.";
                return serviceResponse;
            }

            // Fetch tenant ID from current tenant service, which should be used for deletion
            var tenantId = _currentTenantService.CurrentTenantId;

            // Retrieve and delete conversation history records (associated with the tenant)
            var conversationHistories = await _unitOfWork.ConversationHistoryRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (conversationHistories.Any())
            {
                _logger.LogInformation($"Deleting {conversationHistories.Count} ConversationHistory records for tenant ID: {tenantId}");
                _unitOfWork.ConversationHistoryRepo.Delete(conversationHistories);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting ConversationHistory records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete conversational model records (associated with the tenant)
            var conversationalModels = await _unitOfWork.ConversationalModelRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (conversationalModels.Any())
            {
                _logger.LogInformation($"Deleting {conversationalModels.Count} ConversationalModel records for tenant ID: {tenantId}");
                _unitOfWork.ConversationalModelRepo.Delete(conversationalModels);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting ConversationalModel records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete generative model records (associated with the tenant)
            var generativeModels = await _unitOfWork.GenerativeModelRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (generativeModels.Any())
            {
                _logger.LogInformation($"Deleting {generativeModels.Count} GenerativeModel records for tenant ID: {tenantId}");
                _unitOfWork.GenerativeModelRepo.Delete(generativeModels);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting GenerativeModel records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete API key records (associated with the tenant for AI project versions)
            var aiProjectVersionApiKeys = await _unitOfWork.AIProjectVersionApiKeyRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (aiProjectVersionApiKeys.Any())
            {
                _logger.LogInformation($"Deleting {aiProjectVersionApiKeys.Count} AIProjectVersionApiKey records for tenant ID: {tenantId}");
                _unitOfWork.AIProjectVersionApiKeyRepo.Delete(aiProjectVersionApiKeys);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AIProjectVersionApiKey records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete extracted data records (associated with the tenant)
            var extractedDatas = await _unitOfWork.ExtractedDataRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (extractedDatas.Any())
            {
                _logger.LogInformation($"Deleting {extractedDatas.Count} ExtractedData records for tenant ID: {tenantId}");
                _unitOfWork.ExtractedDataRepo.Delete(extractedDatas);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting ExtractedData records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete AI project version tasks (associated with the tenant)
            var aiProjectVersionTasks = await _unitOfWork.VersionTaskRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (aiProjectVersionTasks.Any())
            {
                _logger.LogInformation($"Deleting {aiProjectVersionTasks.Count} AIProjectVersionTask records for tenant ID: {tenantId}");
                _unitOfWork.VersionTaskRepo.Delete(aiProjectVersionTasks);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AIProjectVersionTask records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete AI project versions (associated with the tenant)
            var aiProjectVersions = await _unitOfWork.AIProjectVersionRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (aiProjectVersions.Any())
            {
                _logger.LogInformation($"Deleting {aiProjectVersions.Count} AIProjectVersion records for tenant ID: {tenantId}");
                _unitOfWork.AIProjectVersionRepo.Delete(aiProjectVersions);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AIProjectVersion records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete AI projects (associated with the tenant)
            var aiProjects = await _unitOfWork.AIProjectRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (aiProjects.Any())
            {
                _logger.LogInformation($"Deleting {aiProjects.Count} AIProject records for tenant ID: {tenantId}");
                _unitOfWork.AIProjectRepo.Delete(aiProjects);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AIProject records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete users (associated with the tenant)
            var tenantUsers = await _unitOfWork.ModelBuilderUserRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (tenantUsers.Any())
            {
                _logger.LogInformation($"Deleting {tenantUsers.Count} ModelBuilderUser records for tenant ID: {tenantId}");
                _unitOfWork.ModelBuilderUserRepo.Delete(tenantUsers);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting ModelBuilderUser records.");
                    return serviceResponse;
                }
            }

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
}