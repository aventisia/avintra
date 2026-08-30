namespace AccountsAPIs.Services;

public class BillingHistoryService : IBillingHistoryService
{
    private readonly ILogger<BillingHistoryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public BillingHistoryService(
        ILogger<BillingHistoryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId and _tenantId from the HTTP context (JWT claims)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Get a list of billing history records
    public async Task<ServiceResponse<IEnumerable<BillingHistoryDto>>> GetBillingHistoryListAsync()
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<IEnumerable<BillingHistoryDto>>
        {
            Data = null,
            Message = "Failed to retrieve billing history. Please try again"
        };

        try
        {
            // Try to get billing history records
            var billingHistories = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    (w.PaymentStatus == PaymentStatusTypesEnum.Captured ||
                     w.PaymentStatus == PaymentStatusTypesEnum.Refunded ||
                     w.PaymentStatus == PaymentStatusTypesEnum.Failed)
                )
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Task successful
            serviceResponse.Data = billingHistories.Adapt<IEnumerable<BillingHistoryDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing history retrieved successfully";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Creates a new billing history record
    public async Task<ServiceResponse<BillingHistoryDto>> InsertBillingHistoryAsync(BillingHistoryDto billingHistoryDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<BillingHistoryDto>
        {
            Data = null,
            Message = "Failed to insert billing history. Please try again"
        };

        try
        {
            // Get billling detail
            var billingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .FirstOrDefaultAsync();

            // Check if the billing detail exists
            if (billingDetail == null)
            {
                serviceResponse.Message = "Billing details not found for the current tenant.";
                return serviceResponse;
            }

            // Default mapping from DTO to BillingHistory
            var newBillingHistory = billingHistoryDto.Adapt<BillingHistory>();
            newBillingHistory.BillingDetailId = billingDetail.Id;
            newBillingHistory.CreatedByUserId = _userId;
            newBillingHistory.LastModifiedByUserId = _userId;

            // Insert the new billing history
            await _unitOfWork.BillingHistoryRepo.InsertAsync(newBillingHistory);

            // If insertion fails
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newBillingHistory.Adapt<BillingHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing history added successfully";

        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing billing history record
    public async Task<ServiceResponse<BillingHistoryDto>> UpdateBillingHistoryAsync(BillingHistoryDto billingHistoryDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<BillingHistoryDto>
        {
            Data = null,
            Message = "Failed to update billing history. Please try again"
        };

        try
        {
            // Validate billing history existence
            var billingHistory = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == billingHistoryDto.Id &&
                    w.TenantId == _tenantId
                )
                .SingleOrDefaultAsync();

            // Billing history does not exist
            if (billingHistory == null)
            {
                serviceResponse.Message = "Billing history does not exist";
                return serviceResponse;
            }

            // Auto-mapping from DTO to existing BillingHistory entity
            var updatedBillingHistory = billingHistoryDto.Adapt(billingHistory);

            // Update the billing history record
            _unitOfWork.BillingHistoryRepo.Update(updatedBillingHistory);
            updatedBillingHistory.CreatedByUserId = _userId;
            updatedBillingHistory.LastModifiedByUserId = _userId;

            // If update fails
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = updatedBillingHistory.Adapt<BillingHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing history updated successfully";

        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a billing history record
    public async Task<ServiceResponse<bool>> DeleteBillingHistoryAsync(Guid id)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete billing history. Please try again"
        };

        try
        {
            // Try to get the billing history record by ID
            var billingHistory = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == id &&
                    w.TenantId == _tenantId
                )
                .SingleOrDefaultAsync();

            // Billing history does not exist
            if (billingHistory == null)
            {
                serviceResponse.Message = "Billing history does not exist";
                return serviceResponse;
            }

            // Delete the billing history record
            _unitOfWork.BillingHistoryRepo.Delete(billingHistory);

            // If deletion fails
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing history deleted successfully";

        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }
}