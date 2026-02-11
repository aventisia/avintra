namespace WorkspaceAPIs.Services;

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

            // Retrieve and delete key store records (associated with the tenant)
            var keyStores = await _unitOfWork.KeyStoreRepo.GetByConditionAsync(k => k.TenantId == tenantId).ToListAsync();
            if (keyStores.Any())
            {
                _logger.LogInformation($"Deleting {keyStores.Count} KeyStore records for tenant ID: {tenantId}");
                _unitOfWork.KeyStoreRepo.Delete(keyStores);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting KeyStore records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete app secret records (associated with the tenant)
            var appSecrets = await _unitOfWork.AppSecretRepo.GetByConditionAsync(a => a.TenantId == tenantId).ToListAsync();
            if (appSecrets.Any())
            {
                _logger.LogInformation($"Deleting {appSecrets.Count} AppSecret records for tenant ID: {tenantId}");
                _unitOfWork.AppSecretRepo.Delete(appSecrets);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AppSecret records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete vault records (associated with the tenant)
            var vaults = await _unitOfWork.VaultRepo.GetByConditionAsync(v => v.TenantId == tenantId).ToListAsync();
            if (vaults.Any())
            {
                _logger.LogInformation($"Deleting {vaults.Count} Vault records for tenant ID: {tenantId}");
                _unitOfWork.VaultRepo.Delete(vaults);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Vault records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete job records (associated with the tenant)
            var jobs = await _unitOfWork.JobRepo.GetByConditionAsync(j => j.TenantId == tenantId).ToListAsync();
            if (jobs.Any())
            {
                _logger.LogInformation($"Deleting {jobs.Count} Job records for tenant ID: {tenantId}");
                _unitOfWork.JobRepo.Delete(jobs);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Job records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete time trigger records (associated with the tenant)
            var timeTriggers = await _unitOfWork.TriggerRepo.GetByConditionAsync(t => t.TenantId == tenantId).ToListAsync();
            if (timeTriggers.Any())
            {
                _logger.LogInformation($"Deleting {timeTriggers.Count} TimeTrigger records for tenant ID: {tenantId}");
                _unitOfWork.TriggerRepo.Delete(timeTriggers);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting TimeTrigger records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete queue records (associated with the tenant)
            var queues = await _unitOfWork.QueueRepo.GetByConditionAsync(q => q.TenantId == tenantId).ToListAsync();
            if (queues.Any())
            {
                _logger.LogInformation($"Deleting {queues.Count} Queue records for tenant ID: {tenantId}");
                _unitOfWork.QueueRepo.Delete(queues);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Queue records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete machine records (associated with the tenant)
            var machines = await _unitOfWork.MachineRepo.GetByConditionAsync(m => m.TenantId == tenantId).ToListAsync();
            if (machines.Any())
            {
                _logger.LogInformation($"Deleting {machines.Count} Machine records for tenant ID: {tenantId}");
                _unitOfWork.MachineRepo.Delete(machines);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Machine records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete flow version records (associated with the tenant)
            var flowVersions = await _unitOfWork.FlowVersionRepo.GetByConditionAsync(f => f.TenantId == tenantId).ToListAsync();
            if (flowVersions.Any())
            {
                _logger.LogInformation($"Deleting {flowVersions.Count} FlowVersion records for tenant ID: {tenantId}");
                _unitOfWork.FlowVersionRepo.Delete(flowVersions);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting FlowVersion records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete flow records (associated with the tenant)
            var flows = await _unitOfWork.FlowRepo.GetByConditionAsync(f => f.TenantId == tenantId).ToListAsync();
            if (flows.Any())
            {
                _logger.LogInformation($"Deleting {flows.Count} Flow records for tenant ID: {tenantId}");
                _unitOfWork.FlowRepo.Delete(flows);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Flow records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete support ticket records (associated with the tenant)
            var supportTickets = await _unitOfWork.SupportTicketRepo.GetByConditionAsync(s => s.TenantId == tenantId).ToListAsync();
            if (supportTickets.Any())
            {
                _logger.LogInformation($"Deleting {supportTickets.Count} SupportTicket records for tenant ID: {tenantId}");
                _unitOfWork.SupportTicketRepo.Delete(supportTickets);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting SupportTicket records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete notification records (associated with the tenant)
            var notifications = await _unitOfWork.NotificationRepo.GetByConditionAsync(n => n.TenantId == tenantId).ToListAsync();
            if (notifications.Any())
            {
                _logger.LogInformation($"Deleting {notifications.Count} Notification records for tenant ID: {tenantId}");
                _unitOfWork.NotificationRepo.Delete(notifications);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Notification records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete project template records (associated with the tenant)
            var projectTemplates = await _unitOfWork.ProjectTemplateRepo.GetByConditionAsync(p => p.TenantId == tenantId).ToListAsync();
            if (projectTemplates.Any())
            {
                _logger.LogInformation($"Deleting {projectTemplates.Count} ProjectTemplate records for tenant ID: {tenantId}");
                _unitOfWork.ProjectTemplateRepo.Delete(projectTemplates);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting ProjectTemplate records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete on-prem model records (associated with the tenant)
            var onPremModels = await _unitOfWork.OnPremModelRepo.GetByConditionAsync(o => o.TenantId == tenantId).ToListAsync();
            if (onPremModels.Any())
            {
                _logger.LogInformation($"Deleting {onPremModels.Count} OnPremModel records for tenant ID: {tenantId}");
                _unitOfWork.OnPremModelRepo.Delete(onPremModels);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting OnPremModel records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete subscription records (associated with the tenant)
            var subscriptions = await _unitOfWork.SubscriptionRepo.GetByConditionAsync(s => s.TenantId == tenantId).ToListAsync();
            if (subscriptions.Any())
            {
                _logger.LogInformation($"Deleting {subscriptions.Count} Subscription records for tenant ID: {tenantId}");
                _unitOfWork.SubscriptionRepo.Delete(subscriptions);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Subscription records.");
                    return serviceResponse;
                }
            }

            // Retrieve and delete users (associated with the tenant)
            var worcUsers = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();
            if (worcUsers.Any())
            {
                _logger.LogInformation($"Deleting {worcUsers.Count} WorkspaceUser records for tenant ID: {tenantId}");
                _unitOfWork.WorkspaceUserRepo.Delete(worcUsers);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting WorkspaceUser records.");
                    return serviceResponse;
                }
            }

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
}
