using Org.BouncyCastle.Asn1;

namespace MLModelBuilderAPIs.Services;

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
            // Retrieve all conversation history records associated with the specified tenant
            var conversationHistories = await _unitOfWork.ConversationHistoryRepo.GetByConditionAsync(history => history.TenantId == tenantId).ToListAsync();

            // Check if there are any conversation history records for the tenant
            if (conversationHistories.Any())
            {
                _logger.LogInformation("Deleting {ConversationHistoryCount} conversation history records associated with tenant ID {TenantId}", conversationHistories.Count, tenantId);

                // Delete all conversation history records related to the tenant from the database
                _unitOfWork.ConversationHistoryRepo.Delete(conversationHistories);
            }

            // Retrieve all conversational model records associated with the specified tenant
            var conversationalModels = await _unitOfWork.ConversationalModelRepo.GetByConditionAsync(model => model.TenantId == tenantId).ToListAsync();

            // Check if there are any conversational model records for the tenant
            if (conversationalModels.Any())
            {
                _logger.LogInformation("Deleting {ConversationalModelCount} conversational model records associated with tenant ID {TenantId}", conversationalModels.Count, tenantId);

                // Delete all conversational model records related to the tenant from the database
                _unitOfWork.ConversationalModelRepo.Delete(conversationalModels);
            }

            // Retrieve all generative model records associated with the specified tenant
            var generativeModels = await _unitOfWork.GenerativeModelRepo.GetByConditionAsync(model => model.TenantId == tenantId).ToListAsync();

            // Check if there are any generative model records for the tenant
            if (generativeModels.Any())
            {
                _logger.LogInformation("Deleting {GenerativeModelCount} generative model records associated with tenant ID {TenantId}", generativeModels.Count, tenantId);

                // Delete all generative model records related to the tenant from the database
                _unitOfWork.GenerativeModelRepo.Delete(generativeModels);
            }

            // Retrieve all API key records associated with the specified tenant for AI project versions
            var aiProjectVersionApiKeys = await _unitOfWork.AIProjectVersionApiKeyRepo.GetByConditionAsync(apiKey => apiKey.TenantId == tenantId).ToListAsync();

            // Check if there are any API key records for the tenant
            if (aiProjectVersionApiKeys.Any())
            {
                // Log the deletion of API key records for the tenant
                _logger.LogInformation("Deleting {ApiKeyCount} API key records associated with tenant ID {TenantId}", aiProjectVersionApiKeys.Count, tenantId);

                // Delete all API key records related to the tenant from the database
                _unitOfWork.AIProjectVersionApiKeyRepo.Delete(aiProjectVersionApiKeys);
            }

            // Retrieve all extracted data records associated with the specified tenant
            var extractedDatas = await _unitOfWork.ExtractedDataRepo.GetByConditionAsync(data => data.TenantId == tenantId).ToListAsync();

            // Check if there are any extracted data records for the tenant
            if (extractedDatas.Any())
            {
                // Log the deletion of extracted data records for the tenant
                _logger.LogInformation("Deleting {DataCount} extracted data records associated with tenant ID {TenantId}", extractedDatas.Count, tenantId);

                // Delete all extracted data records related to the tenant from the database
                _unitOfWork.ExtractedDataRepo.Delete(extractedDatas);
            }

            // Retrieve all ai project model version tasks associated with the specified tenant
            var aiProjectVersionTasks = await _unitOfWork.VersionTaskRepo.GetByConditionAsync(task => task.TenantId == tenantId).ToListAsync();

            // Check if any ai project model version tasks exist for the tenant
            if (aiProjectVersionTasks.Any())
            {
                _logger.LogInformation("Deleting {TaskCount} ai project model version tasks associated with tenant ID {TenantId}", aiProjectVersionTasks.Count, tenantId);

                // Remove all ai project model version tasks related to the tenant from the database
                _unitOfWork.VersionTaskRepo.Delete(aiProjectVersionTasks);
            }

            // Retrieve all ai project model records associated with the specified tenant
            var aiProjectVersions = await _unitOfWork.AIProjectVersionRepo.GetByConditionAsync(version => version.TenantId == tenantId).ToListAsync();

            // Check if any ai project model records exist for the tenant
            if (aiProjectVersions.Any())
            {
                // Log the deletion of ai project model records for the tenant
                _logger.LogInformation("Deleting {ModelCount} ai project model records associated with tenant ID {TenantId}", aiProjectVersions.Count, tenantId);

                // Remove all ai project model records related to the tenant from the database
                _unitOfWork.AIProjectVersionRepo.Delete(aiProjectVersions);
            }

            // Fetch all AI project records linked to the specified tenant
            var aiProjects = await _unitOfWork.AIProjectRepo.GetByConditionAsync(project => project.TenantId == tenantId).ToListAsync();

            // Check if any AI project records exist for the tenant
            if (aiProjects.Any())
            {
                _logger.LogInformation("Deleting {ProjectCount} AI project records associated with tenant ID {TenantId}", aiProjects.Count, tenantId);

                // Remove all AI project records related to the tenant from the database
                _unitOfWork.AIProjectRepo.Delete(aiProjects);
            }

            // Fetch all users linked to the specified tenant
            var tenantUsers = await _unitOfWork.ModelBuilderUserRepo.GetByConditionAsync(user => user.TenantId == tenantId).ToListAsync();

            // Check if any users are found for the tenant
            if (tenantUsers.Any())
            {
                _logger.LogInformation("Removing {UserCount} users associated with tenant ID {TenantId}", tenantUsers.Count, tenantId);

                // Remove all users associated with the tenant from the database
                _unitOfWork.ModelBuilderUserRepo.Delete(tenantUsers);
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