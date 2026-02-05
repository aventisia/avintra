namespace WorkspaceAPIs.Services;

public class TenantTableService : ITenantTableService
{
    private readonly ILogger<TenantTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public TenantTableService(
        ILogger<TenantTableService> logger,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Deletes a tenant and all associated data from the database.
    public async Task<ServiceResponse<bool>> DeleteTenantAsync(Guid tenantId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tenant records. Please try again later."
        };

        try
        {
            // Retrieve all key store records associated with the specified tenant
            var keyStores = await _unitOfWork.KeyStoreRepo.GetByConditionAsync(k => k.TenantId == tenantId).ToListAsync();

            // Check if there are any key store records associated with the tenant
            if (keyStores.Any())
            {
                // Log the deletion of key store records related to the tenant
                _logger.LogInformation("Deleting {KeyStoreCount} key store records associated with tenant ID {TenantId}", keyStores.Count, tenantId);

                // Delete all key store records related to the tenant from the database
                _unitOfWork.KeyStoreRepo.Delete(keyStores);
            }

            // Retrieve all app secret records associated with the specified tenant
            var appSecrets = await _unitOfWork.AppSecretRepo.GetByConditionAsync(a => a.TenantId == tenantId).ToListAsync();

            // Check if there are any app secret records associated with the tenant
            if (appSecrets.Any())
            {
                // Log the deletion of app secret records related to the tenant
                _logger.LogInformation("Deleting {AppSecretCount} app secret records associated with tenant ID {TenantId}", appSecrets.Count, tenantId);

                // Delete all app secret records related to the tenant from the database
                _unitOfWork.AppSecretRepo.Delete(appSecrets);
            }

            // Retrieve all vault records associated with the specified tenant
            var vaults = await _unitOfWork.VaultRepo.GetByConditionAsync(v => v.TenantId == tenantId).ToListAsync();

            // Check if there are any vault records associated with the tenant
            if (vaults.Any())
            {
                _logger.LogInformation("Deleting {VaultCount} vault records associated with tenant ID {TenantId}", vaults.Count, tenantId);

                // Delete all vault records related to the tenant from the database
                _unitOfWork.VaultRepo.Delete(vaults);
            }

            // Retrieve all job records associated with the specified tenant
            var jobs = await _unitOfWork.JobRepo.GetByConditionAsync(j => j.TenantId == tenantId).ToListAsync();

            // Check if there are any job records associated with the tenant
            if (jobs.Any())
            {
                _logger.LogInformation("Deleting {JobCount} job records associated with tenant ID {TenantId}", jobs.Count, tenantId);

                // Delete all job records related to the tenant from the database
                _unitOfWork.JobRepo.Delete(jobs);
            }

            // Retrieve all time trigger records associated with the specified tenant
            var timeTriggers = await _unitOfWork.TriggerRepo.GetByConditionAsync(t => t.TenantId == tenantId).ToListAsync();

            // Check if there are any time trigger records associated with the tenant
            if (timeTriggers.Any())
            {
                // Log the deletion of time trigger records related to the tenant
                _logger.LogInformation("Deleting {TimeTriggerCount} time trigger records associated with tenant ID {TenantId}", timeTriggers.Count, tenantId);

                // Delete all time trigger records related to the tenant from the database
                _unitOfWork.TriggerRepo.Delete(timeTriggers);
            }

            // Retrieve all queue records associated with the specified tenant
            var queues = await _unitOfWork.QueueRepo.GetByConditionAsync(q => q.TenantId == tenantId).ToListAsync();

            // Check if there are any queue records associated with the tenant
            if (queues.Any())
            {
                // Log the deletion of queue records related to the tenant
                _logger.LogInformation("Deleting {QueueCount} queue records associated with tenant ID {TenantId}", queues.Count, tenantId);

                // Delete all queue records related to the tenant from the database
                _unitOfWork.QueueRepo.Delete(queues);
            }

            // Retrieve all machine records associated with the specified tenant
            var machines = await _unitOfWork.MachineRepo.GetByConditionAsync(m => m.TenantId == tenantId).ToListAsync();

            // Check if there are any machine records associated with the tenant
            if (machines.Any())
            {
                // Log the deletion of machine records related to the tenant
                _logger.LogInformation("Deleting {MachineCount} machine records associated with tenant ID {TenantId}", machines.Count, tenantId);

                // Delete all machine records related to the tenant from the database
                _unitOfWork.MachineRepo.Delete(machines);
            }

            // Retrieve all flow version records associated with the specified tenant
            var flowVersions = await _unitOfWork.FlowVersionRepo.GetByConditionAsync(f => f.TenantId == tenantId).ToListAsync();

            // Check if there are any flow version records for the tenant
            if (flowVersions.Any())
            {
                // Log the deletion of flow version records associated with the tenant
                _logger.LogInformation("Deleting {FlowVersionCount} flow version records related to tenant ID {TenantId}", flowVersions.Count, tenantId);

                // Delete all flow version records related to the tenant from the database
                _unitOfWork.FlowVersionRepo.Delete(flowVersions);
            }

            // Retrieve all flow records associated with the specified tenant
            var flows = await _unitOfWork.FlowRepo.GetByConditionAsync(f => f.TenantId == tenantId).ToListAsync();

            // Check if there are any flow records associated with the tenant
            if (flows.Any())
            {
                _logger.LogInformation("Deleting {FlowCount} flow records associated with tenant ID {TenantId}", flows.Count, tenantId);

                // Delete all flow records related to the tenant from the database
                _unitOfWork.FlowRepo.Delete(flows);
            }

            // Retrieve all support ticket records associated with the specified tenant
            var supportTickets = await _unitOfWork.SupportTicketRepo.GetByConditionAsync(s => s.TenantId == tenantId).ToListAsync();

            // Check if there are any support tickets associated with the tenant
            if (supportTickets.Any())
            {
                _logger.LogInformation("Deleting {SupportTicketCount} support ticket records associated with tenant ID {TenantId}", supportTickets.Count, tenantId);

                // Delete all support ticket records related to the tenant from the database
                _unitOfWork.SupportTicketRepo.Delete(supportTickets);
            }

            // Retrieve all notification records associated with the specified tenant
            var notifications = await _unitOfWork.NotificationRepo.GetByConditionAsync(n => n.TenantId == tenantId).ToListAsync();

            // Check if there are any notifications associated with the tenant
            if (notifications.Any())
            {
                // Log the deletion of notification records related to the tenant
                _logger.LogInformation("Deleting {NotificationCount} notification records associated with tenant ID {TenantId}", notifications.Count, tenantId);

                // Delete all notification records related to the tenant from the database
                _unitOfWork.NotificationRepo.Delete(notifications);
            }

            // Retrieve all project template records associated with the specified tenant
            var projectTemplates = await _unitOfWork.ProjectTemplateRepo.GetByConditionAsync(p => p.TenantId == tenantId).ToListAsync();

            // Check if there are any project template records for the tenant
            if (projectTemplates.Any())
            {
                // Log the deletion of project template records related to the tenant
                _logger.LogInformation("Deleting {ProjectTemplateCount} project template records associated with tenant ID {TenantId}", projectTemplates.Count, tenantId);

                // Delete all project template records related to the tenant from the database
                _unitOfWork.ProjectTemplateRepo.Delete(projectTemplates);
            }

            // Retrieve all on-prem model records associated with the specified tenant
            var onPremModels = await _unitOfWork.OnPremModelRepo.GetByConditionAsync(o => o.TenantId == tenantId).ToListAsync();

            // Check if there are any on-prem model records associated with the tenant
            if (onPremModels.Any())
            {
                // Log the deletion of on-prem model records related to the tenant
                _logger.LogInformation("Deleting {OnPremModelCount} on-prem model records associated with tenant ID {TenantId}", onPremModels.Count, tenantId);

                // Delete all on-prem model records related to the tenant from the database
                _unitOfWork.OnPremModelRepo.Delete(onPremModels);
            }

            // Retrieve all subscription records associated with the specified tenant
            var subscriptions = await _unitOfWork.SubscriptionRepo.GetByConditionAsync(s => s.TenantId == tenantId).ToListAsync();

            // Check if there are any subscription records for the tenant
            if (subscriptions.Any())
            {
                // Log the deletion of subscription records related to the tenant
                _logger.LogInformation("Deleting {SubscriptionCount} subscription records associated with tenant ID {TenantId}", subscriptions.Count, tenantId);

                // Delete all subscription records related to the tenant from the database
                _unitOfWork.SubscriptionRepo.Delete(subscriptions);
            }

            // Retrieve all users associated with the specified tenant
            var worcUsers = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.TenantId == tenantId).ToListAsync();

            // Check if there are any users associated with the tenant
            if (worcUsers.Any())
            {
                _logger.LogInformation("Deleting {UserCount} users associated with tenant ID {TenantId}", worcUsers.Count, tenantId);

                // Delete all users related to the tenant from the database
                _unitOfWork.WorkspaceUserRepo.Delete(worcUsers);
            }


            // Attempt to commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                // If no changes were saved, it means deletion may not have been executed
                serviceResponse.Message = "Tenant and associated data have been deleted successfully.";
            }
            else
            {
                // If no records were deleted (perhaps the tenant was already removed), inform the user
                serviceResponse.Message = "No changes were made, likely because the tenant was already deleted.";
            }

            // Mark the response as successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            // Log an error if the deletion operation fails
            _logger.LogError(ex, "Error occurred while attempting to delete tenant with ID {TenantId}", tenantId);
            serviceResponse.Message = "An error occurred while trying to delete the tenant. Please try again later.";
        }

        // Return the response indicating success or failure
        return serviceResponse;
    }
}