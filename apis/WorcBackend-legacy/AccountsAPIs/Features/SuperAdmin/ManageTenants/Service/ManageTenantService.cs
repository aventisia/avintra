namespace AccountsAPIs.Services;

public class ManageTenantService : IManageTenantService
{
    private readonly ILogger<ManageTenantService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IAzureBlobStorageService _azureBlobStorageService;
    private readonly Guid _userId;
    private readonly Guid _userTenantId;
    private readonly string _jwt;
    private readonly EnvironmentConfig _environmentConfig;


    public ManageTenantService(
        ILogger<ManageTenantService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IAzureBlobStorageService azureBlobStorageService,
        EnvironmentConfig environmentConfig)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userTenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? "jwt-not-found";

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _azureBlobStorageService = azureBlobStorageService;
        _environmentConfig = environmentConfig;
    }

    // Deletes a tenant and all associated data after validation checks. Performs tenant validation (e.g., if it exists, is editable, not default, has no billing history), then attempts to delete the tenant record and all related data.
    public async Task<ServiceResponse<bool>> DeleteTenantAsync()
    {
        // Default failed serviceResponse object
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tenant. Please try again later."
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

            // Fetch tenant from repository with deletion constraints
            _logger.LogInformation($"Attempting to fetch tenant record for deletion. TenantId: {tenantIdToBeDeleted}");
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w =>
                    w.IsEditable &&
                    w.Id != _userTenantId && // Exclude the current tenant from being deleted
                    w.Id == tenantIdToBeDeleted)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Check if tenant exists
            if (tenant == null)
            {
                _logger.LogInformation($"Tenant not found. TenantId: {tenantIdToBeDeleted}. It may have already been deleted or is not eligible for deletion.");
                serviceResponse.Message = "Tenant does not exist or is not eligible for deletion.";
                return serviceResponse;
            }

            // Check if tenant is a default system tenant (can't delete default tenant)
            if (tenant.IsDefault)
            {
                _logger.LogWarning($"Attempt to delete system default tenant blocked. TenantId: {tenant.Id}, Name: {tenant.Name}");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Cannot delete the system default tenant.";
                return serviceResponse;
            }

            // Check for billing history (paid tenants can't be deleted)
            var hasBillingHistory = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w => w.TenantId == tenant.Id)
                .AnyAsync();

            if (hasBillingHistory)
            {
                _logger.LogWarning($"Tenant deletion blocked due to existing billing history. TenantId: {tenant.Id}");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Cannot delete a tenant with existing billing history.";
                return serviceResponse;
            }

            // First, delete the tenant's related data (payment history, subscriptions, etc.)
            bool deletionSuccess = await DeleteTenantRelatedDataAsync(tenant);

            if (!deletionSuccess)
            {
                _logger.LogError($"Failed to delete related data for tenant ID: {tenant.Id}");
                return serviceResponse;
            }

            // Proceed with deleting tenant record
            _logger.LogInformation($"Attempting to delete tenant record. TenantId: {tenant.Id}, Name: {tenant.Name}");
            _unitOfWork.TenantRepo.Delete(tenant);

            // Persist changes in the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"SaveChanges failed while deleting tenant record. TenantId: {tenant.Id}, Name: {tenant.Name}");
                return serviceResponse;
            }

            // Log successful deletion of tenant
            _logger.LogInformation($"Tenant successfully deleted. TenantId: {tenant.Id}, Name: {tenant.Name}");

            // Blob storage deletion
            var blobDeleted = await _azureBlobStorageService.RemoveContainerAsync(tenant.ContainerName);
            if (blobDeleted)
            {
                _logger.LogInformation($"Blob container '{tenant.ContainerName}' deleted successfully.");
            }
            else
            {
                _logger.LogError($"Failed to delete blob container '{tenant.ContainerName}' for tenant ID: {tenant.Id}");
            }

            // Update response to indicate successful deletion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200; // Success status code
            serviceResponse.Message = "Tenant deleted successfully.";
            return serviceResponse;
        }
        catch (Exception ex)
        {
            // Catch unexpected errors and log them with detailed information
            _logger.LogError(ex, $"Unexpected error occurred while deleting tenant. TenantId: {_currentTenantService.CurrentTenantId}");
        }
        return serviceResponse;
    }

    private async Task<bool> DeleteTenantRelatedDataAsync(Tenant tenant)
    {
        // Start the deletion process and log the tenant information for tracking
        _logger.LogInformation("Starting deletion of related data for tenant ID: {TenantId}, Name: {TenantName}", tenant.Id, tenant.Name);

        try
        {
            var workspaceApiUrl = $"{_environmentConfig.WorkspaceApiBaseUrl}/api/sa/tenant";

            // Create a new HttpClient instance for making API requests
            using var httpClient = new HttpClient();

            // Helper function to send DELETE request to the specified API
            async Task<bool> CallExternalDeleteApi(string apiUrl, Guid tenantId, string tenantName)
            {
                // Prepare the DELETE request with necessary headers (Authorization & TenantId)
                using var request = new HttpRequestMessage(HttpMethod.Delete, apiUrl);
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _jwt);
                request.Headers.Add("X-TENANT-ID", tenantId.ToString());

                // Log the outgoing request to the external API for transparency
                _logger.LogInformation("Sending DELETE request to {ApiUrl} for tenant {TenantId}", apiUrl, tenantId);

                // Send the DELETE request and wait for the response
                var response = await httpClient.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();

                // Check if the response was successful
                if (!response.IsSuccessStatusCode)
                {
                    // Log detailed error if the request failed
                    _logger.LogError("Failed DELETE request to {ApiUrl} for tenant {TenantId}. Status: {Status}, Response: {Content}",
                        apiUrl, tenantId, response.StatusCode, content);
                    return false;  // Return false to indicate failure
                }

                // Deserialize the response content into ServiceResponse
                var apiResponse = JsonSerializer.Deserialize<ServiceResponse<bool>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // Check if the response was valid and contains success status
                if (apiResponse == null || !apiResponse.Data)
                {
                    // Log error with detailed message if API returned failure
                    _logger.LogError("API returned failure for tenant {TenantName}, ID: {TenantId}. Message: {Message}", tenantName, tenantId, apiResponse?.Message);
                    return false;  // Return false if the deletion failed
                }

                // Log success message after a successful deletion call
                _logger.LogInformation("Successfully deleted tenant in API {ApiUrl} for tenant {TenantId}", apiUrl, tenantId);
                return true;
            }

            // Call Workspace API for deletion
            var workspaceResult = await CallExternalDeleteApi(workspaceApiUrl, tenant.Id, tenant.Name);
            if (!workspaceResult)
            {
                // Log failure and return early if Workspace API call failed
                _logger.LogError("Workspace API call failed for tenant {TenantId}", tenant.Id);
                return false;
            }

            // After successfully deleting tenant data from external APIs, proceed with the local database cleanup.

            // Delete PaymentHistory
            if (!await DeleteEntitiesAsync(_unitOfWork.PaymentHistoryRepo, w => w.TenantId == tenant.Id, nameof(PaymentHistory), tenant.Id))
                return false;

            // Delete PaymentMethod
            if (!await DeleteEntitiesAsync(_unitOfWork.PaymentMethodRepo, w => w.TenantId == tenant.Id, nameof(PaymentMethod), tenant.Id))
                return false;

            // Delete CreditUsage
            if (!await DeleteEntitiesAsync(_unitOfWork.CreditUsageRepo, w => w.TenantId == tenant.Id, nameof(CreditUsage), tenant.Id))
                return false;

            // Delete TenantCredit
            if (!await DeleteEntitiesAsync(_unitOfWork.TenantCreditRepo, w => w.TenantId == tenant.Id, nameof(TenantCredit), tenant.Id))
                return false;

            // Delete BillingHistory
            if (!await DeleteEntitiesAsync(_unitOfWork.BillingHistoryRepo, w => w.TenantId == tenant.Id, nameof(BillingHistory), tenant.Id))
                return false;

            // Delete BillingDetail
            if (!await DeleteEntitiesAsync(_unitOfWork.BillingDetailRepo, w => w.TenantId == tenant.Id, nameof(BillingDetail), tenant.Id))
                return false;

            // Delete TenantSubscription
            if (!await DeleteEntitiesAsync(_unitOfWork.TenantSubscriptionRepo, w => w.TenantId == tenant.Id, nameof(TenantSubscription), tenant.Id))
                return false;

            // Delete SpaceUser - DeleteBehavior.Cascade set with Space

            // Delete Space
            if (!await DeleteEntitiesAsync(_unitOfWork.SpaceRepo, w => w.TenantId == tenant.Id, nameof(Space), tenant.Id))
                return false;

            // Delete AppIntegration
            if (!await DeleteEntitiesAsync(_unitOfWork.AppIntegrationRepo, w => w.TenantId == tenant.Id, nameof(AppIntegration), tenant.Id))
                return false;

            // --- Get user IDs of tenant users to delete related records where - No TenantId, only UserId
            var tenantUserIds = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).Select(s => s.Id).ToListAsync();

            // Delete SessionLog (No TenantId, only UserId)
            if (!await DeleteEntitiesAsync(_unitOfWork.SessionLogRepo, w => tenantUserIds.Contains(w.UserId), nameof(SessionLog), tenant.Id))
                return false;

            // Delete ObsoletePwd (No TenantId, only UserId)
            if (!await DeleteEntitiesAsync(_unitOfWork.ObsoletePwdRepo, w => tenantUserIds.Contains(w.UserId), nameof(ObsoletePwd), tenant.Id))
                return false;

            // Delete AuditLog (No TenantId, only UserId)
            if (!await DeleteEntitiesAsync(_unitOfWork.AuditLogRepo, w => tenantUserIds.Contains(w.UserId), nameof(AuditLog), tenant.Id))
                return false;

            // Delete ActiveSession (No TenantId, only UserId)
            if (!await DeleteEntitiesAsync(_unitOfWork.ActiveSessionRepo, w => tenantUserIds.Contains(w.UserId), nameof(ActiveSession), tenant.Id))
                return false;

            // Delete RolePermission (No TenantId, only RoleId) - DeleteBehavior.Cascade set with AccountRole

            // Delete AccountUserRole (No TenantId, only UserId) - DeleteBehavior.Cascade set with AccountUser

            // Delete AccountRole
            if (!await DeleteEntitiesAsync(_unitOfWork.AccountRoleRepo, w => w.TenantId == tenant.Id, nameof(AccountRole), tenant.Id))
                return false;

            // --- Get user emails of tenant users to delete related records where - No TenantId, only Email
            var tenantUserEmails = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).Select(s => s.Email).ToListAsync();

            // Delete VerificationCode (No TenantId, only Email)
            if (!await DeleteEntitiesAsync(_unitOfWork.VerificationCodeRepo, w => tenantUserEmails.Contains(w.Email), nameof(VerificationCode), tenant.Id))
                return false;

            // Delete AccountUser - DeleteBehavior.Cascade set with Tenant

            // Return true, we can proceed to delete tenant record
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error while deleting related data for tenant ID: {tenant.Id}, Exception: {ex.Message}");
            return false;
        }
    }


    // Helper: To delete entities with a common pattern
    private async Task<bool> DeleteEntitiesAsync<TEntity>(
        IRepositoryBase<TEntity, AccountsDbContext> repository,
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