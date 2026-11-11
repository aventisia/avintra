namespace AccountsAPIs.Services;

public class PaymentMethodService : IPaymentMethodService
{
    private readonly ILogger<PaymentMethodService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public PaymentMethodService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<PaymentMethodService> logger,
        IUnitOfWork unitOfWork)
    {
        // Retrieve current user ID from HTTP context claims or fallback
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a payment method by its unique Id
    public async Task<ServiceResponse<PaymentMethodDto>> GetPaymentMethodAsync(Guid paymentMethodId)
    {
        // Initialize service response with default failure message and null data
        var serviceResponse = new ServiceResponse<PaymentMethodDto>
        {
            Data = null,
            Message = "Failed to retrieve payment method, please try again"
        };

        try
        {
            _logger.LogInformation("Querying PaymentMethodRepo for payment method with Id: {PaymentMethodId}", paymentMethodId);

            // Retrieve entity matching the given Id asynchronously
            var paymentMethodEntity = await _unitOfWork.PaymentMethodRepo
                .GetByConditionAsync(w =>
                    w.Id == paymentMethodId &&
                    w.TenantId == _tenantId
                )
                .FirstOrDefaultAsync();

            // Check if entity exists; if null, return failure response
            if (paymentMethodEntity == null)
            {
                _logger.LogWarning("No payment method found for Id: {PaymentMethodId}", paymentMethodId);
                serviceResponse.Message = "Payment method does not exist";
                return serviceResponse;
            }

            // Map entity to DTO for returning to caller
            serviceResponse.Data = paymentMethodEntity.Adapt<PaymentMethodDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment method retrieved successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while retrieving payment method with Id: {PaymentMethodId}", paymentMethodId);
        }

        return serviceResponse;
    }

    // Retrieves all payment methods
    public async Task<ServiceResponse<IEnumerable<PaymentMethodDto>>> GetPaymentMethodsAsync()
    {
        // Initialize service response with failure defaults
        var serviceResponse = new ServiceResponse<IEnumerable<PaymentMethodDto>>
        {
            Data = null,
            Message = "Failed to retrieve payment methods, please try again"
        };

        try
        {

            // Fetch all payment method entities asynchronously as a list
            var paymentMethodEntities = await _unitOfWork.PaymentMethodRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId
                )
                .ToListAsync();

            _logger.LogInformation("Fetched {Count} payment methods.", paymentMethodEntities.Count);

            // Map entity list to DTO list for response
            serviceResponse.Data = paymentMethodEntities.Adapt<IEnumerable<PaymentMethodDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment methods retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while retrieving all payment methods");
        }

        return serviceResponse;
    }

    // Creates a new payment method record
    public async Task<ServiceResponse<PaymentMethodDto>> CreatePaymentMethodAsync(PaymentMethodDto paymentMethodDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<PaymentMethodDto>
        {
            Data = null,
            Message = "Failed to create payment method, please try again"
        };

        try
        {
            _logger.LogInformation("Trimming string properties of PaymentMethodDto.");

            // Clean whitespace from all string properties of DTO
            paymentMethodDto = TrimDtoStringPropsUtil.TrimDtoStringProps(paymentMethodDto);

            _logger.LogInformation("Mapping DTO to PaymentMethod entity.");

            // Map DTO to new PaymentMethod entity instance
            var newPaymentMethodEntity = paymentMethodDto.Adapt<PaymentMethod>();

            // Insert new entity into repository asynchronously
            await _unitOfWork.PaymentMethodRepo.InsertAsync(newPaymentMethodEntity);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save new payment method to database.");
                return serviceResponse;
            }


            // Map entity back to DTO for returning with created data
            serviceResponse.Data = newPaymentMethodEntity.Adapt<PaymentMethodDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment method created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while creating payment method.");
        }

        return serviceResponse;
    }

    // Updates an existing payment method record
    public async Task<ServiceResponse<PaymentMethodDto>> UpdatePaymentMethodAsync(PaymentMethodDto paymentMethodDto)
    {
        // Initialize failure response
        var serviceResponse = new ServiceResponse<PaymentMethodDto>
        {
            Data = null,
            Message = "Failed to update payment method, please try again"
        };

        try
        {
            _logger.LogInformation("Trimming string properties of PaymentMethodDto.");

            // Trim whitespace in DTO strings
            paymentMethodDto = TrimDtoStringPropsUtil.TrimDtoStringProps(paymentMethodDto);

            // Fetch existing entity by Id
            var existingPaymentMethodEntity = await _unitOfWork.PaymentMethodRepo
                .GetByConditionAsync(w =>
                    w.Id == paymentMethodDto.Id &&
                    w.TenantId == _tenantId
                )
                .FirstOrDefaultAsync();

            // If entity does not exist, return early with warning
            if (existingPaymentMethodEntity == null)
            {
                _logger.LogWarning("No existing payment method found with Id: {PaymentMethodId}", paymentMethodDto.Id);
                serviceResponse.Message = "Payment method does not exist";
                return serviceResponse;
            }

            _logger.LogInformation("Mapping updated DTO properties to existing entity.");

            // Map updated fields from DTO onto existing entity
            var updatedPaymentMethodEntity = paymentMethodDto.Adapt(existingPaymentMethodEntity);

            // Apply update to repository
            _unitOfWork.PaymentMethodRepo.Update(updatedPaymentMethodEntity);

            _logger.LogInformation("Saving changes to database.");

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save updates to payment method with Id: {PaymentMethodId}", paymentMethodDto.Id);
                return serviceResponse;
            }


            // Map updated entity back to DTO
            serviceResponse.Data = updatedPaymentMethodEntity.Adapt<PaymentMethodDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment method updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating payment method with Id: {PaymentMethodId}", paymentMethodDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a payment method by Id
    public async Task<ServiceResponse<bool>> DeletePaymentMethodAsync(Guid paymentMethodId)
    {
        // Initialize service response indicating failure by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete payment method, please try again"
        };

        try
        {

            // Attempt to find entity to delete by Id
            var paymentMethodEntity = await _unitOfWork.PaymentMethodRepo
                .GetByConditionAsync(w =>
                    w.Id == paymentMethodId &&
                    w.TenantId == _tenantId
                )
                .FirstOrDefaultAsync();

            // If not found, warn and return
            if (paymentMethodEntity == null)
            {
                _logger.LogWarning("No payment method found with Id: {PaymentMethodId} to delete.", paymentMethodId);
                serviceResponse.Message = "Payment method does not exist";
                return serviceResponse;
            }

            // Mark entity for deletion
            _unitOfWork.PaymentMethodRepo.Delete(paymentMethodEntity);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save deletion of payment method with Id: {PaymentMethodId}", paymentMethodId);
                return serviceResponse;
            }


            // Update response on success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment method deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while deleting payment method with Id: {PaymentMethodId}", paymentMethodId);
        }

        return serviceResponse;
    }

    // Deletes multiple payment methods by a list of Ids
    public async Task<ServiceResponse<bool>> DeleteMultiplePaymentMethodsAsync(IEnumerable<Guid> paymentMethodIds)
    {
        // Initialize failure response by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete payment methods, please try again"
        };

        // Early check: null or empty list
        if (paymentMethodIds == null || !paymentMethodIds.Any())
        {
            _logger.LogWarning("DeleteMultiplePaymentMethodsAsync called with null or empty paymentMethodIds.");
            serviceResponse.Message = "No payment method IDs provided for deletion";
            return serviceResponse;
        }

        try
        {

            // Fetch all entities with Ids in the provided list
            var paymentMethodsToDelete = await _unitOfWork.PaymentMethodRepo
                .GetByConditionAsync(w =>
                    paymentMethodIds.Contains(w.Id) &&
                    w.TenantId == _tenantId
                )
                .ToListAsync();

            // Check if any were found
            if (paymentMethodsToDelete == null || !paymentMethodsToDelete.Any())
            {
                _logger.LogWarning("No payment methods found matching provided IDs for deletion.");
                serviceResponse.Message = "No matching payment methods found to delete";
                return serviceResponse;
            }

            _logger.LogInformation("Found {Count} payment methods to delete. Marking for deletion.", paymentMethodsToDelete.Count);

            // Delete payment methods
            _unitOfWork.PaymentMethodRepo.Delete(paymentMethodsToDelete);
            _logger.LogInformation("Saving changes to database for multiple deletions.");

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save multiple payment method deletions.");
                return serviceResponse;
            }


            // Update response on success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully deleted {paymentMethodsToDelete.Count} payment methods";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while deleting multiple payment methods.");
        }

        return serviceResponse;
    }
}