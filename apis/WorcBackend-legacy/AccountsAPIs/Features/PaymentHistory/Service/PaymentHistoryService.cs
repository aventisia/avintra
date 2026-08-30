namespace AccountsAPIs.Services;

public class PaymentHistoryService : IPaymentHistoryService
{
    private readonly ILogger<PaymentHistoryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public PaymentHistoryService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<PaymentHistoryService> logger,
        IUnitOfWork unitOfWork)
    {
        // Retrieve current user ID from HTTP context claims or fallback
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a payment history record by its unique identifier.
    public async Task<ServiceResponse<PaymentHistoryDto>> GetPaymentHistoryAsync(Guid paymentHistoryId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<PaymentHistoryDto>
        {
            Data = null,
            Message = "Failed to retrieve payment history, please try again"
        };

        _logger.LogInformation("User {UserId} requested payment history with Id {PaymentHistoryId}", _userId, paymentHistoryId);

        try
        {
            // Fetch payment history entity by ID from repository
            var paymentHistoryEntity = await _unitOfWork.PaymentHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == paymentHistoryId &&
                    w.TenantId == _tenantId
                )
                .FirstOrDefaultAsync();

            // Check if payment history exists
            if (paymentHistoryEntity == null)
            {
                _logger.LogWarning("No payment history found for Id {PaymentHistoryId}", paymentHistoryId);
                serviceResponse.Message = "Payment history does not exist";
                return serviceResponse;
            }

            // Map entity to DTO for response
            serviceResponse.Data = paymentHistoryEntity.Adapt<PaymentHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment history retrieved successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while retrieving payment history with Id {PaymentHistoryId}", paymentHistoryId);
        }

        return serviceResponse;
    }

    // Retrieves payment histories filtered by invoice identifier.
    public async Task<ServiceResponse<IEnumerable<PaymentHistoryDto>>> GetPaymentHistoriesAsync()
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<PaymentHistoryDto>>
        {
            Data = null,
            Message = "Failed to retrieve payment histories by invoice, please try again"
        };

        try
        {
            // Fetch payment histories linked to the given invoice ID
            var paymentHistoryEntities = await _unitOfWork.PaymentHistoryRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId
                )
                .ToListAsync();

            // Map entities to DTOs
            serviceResponse.Data = paymentHistoryEntities.Adapt<IEnumerable<PaymentHistoryDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment histories retrieved successfully";

            _logger.LogInformation("{Count} payment histories retrieved", paymentHistoryEntities.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while retrieving payment histories");
        }

        return serviceResponse;
    }

    // Creates a new payment history record.
    public async Task<ServiceResponse<PaymentHistoryDto>> CreatePaymentHistoryAsync(PaymentHistoryDto paymentHistoryDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<PaymentHistoryDto>
        {
            Data = null,
            Message = "Failed to create payment history, please try again"
        };

        _logger.LogInformation("User {UserId} attempting to create a new payment history", _userId);

        try
        {
            // Clean string properties to avoid whitespace issues
            paymentHistoryDto = TrimDtoStringPropsUtil.TrimDtoStringProps(paymentHistoryDto);

            // Map DTO to entity model
            var newPaymentHistoryEntity = paymentHistoryDto.Adapt<PaymentHistory>();

            // Insert new payment history entity into repository
            await _unitOfWork.PaymentHistoryRepo.InsertAsync(newPaymentHistoryEntity);

            // Persist changes to database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist new payment history entity to database");
                return serviceResponse;
            }

            // Map back to DTO for response
            serviceResponse.Data = newPaymentHistoryEntity.Adapt<PaymentHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment history created successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while creating payment history");
        }

        return serviceResponse;
    }

    // Updates an existing payment history record.
    public async Task<ServiceResponse<PaymentHistoryDto>> UpdatePaymentHistoryAsync(PaymentHistoryDto paymentHistoryDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<PaymentHistoryDto>
        {
            Data = null,
            Message = "Failed to update payment history, please try again"
        };

        _logger.LogInformation("User {UserId} attempting to update payment history with Id {PaymentHistoryId}", _userId, paymentHistoryDto.Id);

        try
        {
            // Clean string properties to avoid whitespace issues
            paymentHistoryDto = TrimDtoStringPropsUtil.TrimDtoStringProps(paymentHistoryDto);

            // Fetch existing payment history entity from repository by ID
            var existingPaymentHistoryEntity = await _unitOfWork.PaymentHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == paymentHistoryDto.Id &&
                    w.TenantId == _tenantId
                )
                .FirstOrDefaultAsync();

            // Check if entity exists
            if (existingPaymentHistoryEntity == null)
            {
                _logger.LogWarning("No existing payment history found with Id {PaymentHistoryId}", paymentHistoryDto.Id);
                serviceResponse.Message = "Payment history does not exist";
                return serviceResponse;
            }

            // Map updated properties from DTO onto existing entity
            var updatedPaymentHistoryEntity = paymentHistoryDto.Adapt(existingPaymentHistoryEntity);

            // Mark entity as updated in repository
            _unitOfWork.PaymentHistoryRepo.Update(updatedPaymentHistoryEntity);

            // Persist changes to database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist updates to payment history with Id {PaymentHistoryId}", paymentHistoryDto.Id);
                return serviceResponse;
            }

            // Map updated entity back to DTO for response
            serviceResponse.Data = updatedPaymentHistoryEntity.Adapt<PaymentHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment history updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating payment history with Id {PaymentHistoryId}", paymentHistoryDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a payment history record by its unique identifier.
    public async Task<ServiceResponse<bool>> DeletePaymentHistoryAsync(Guid paymentHistoryId)
    {
        // Initialize response with default failure state and Data set to false
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete payment history, please try again"
        };

        _logger.LogInformation("User {UserId} attempting to delete payment history with Id {PaymentHistoryId}", _userId, paymentHistoryId);

        try
        {
            // Retrieve payment history entity to delete
            var paymentHistoryEntity = await _unitOfWork.PaymentHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == paymentHistoryId &&
                    w.TenantId == _tenantId
                )
                .FirstOrDefaultAsync();

            // Validate existence before deletion
            if (paymentHistoryEntity == null)
            {
                _logger.LogWarning("No payment history found with Id {PaymentHistoryId} to delete", paymentHistoryId);
                serviceResponse.Message = "Payment history does not exist";
                return serviceResponse;
            }

            // Delete entity from repository
            _unitOfWork.PaymentHistoryRepo.Delete(paymentHistoryEntity);

            // Persist deletion to database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist deletion of payment history with Id {PaymentHistoryId}", paymentHistoryId);
                return serviceResponse;
            }

            // Set successful response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment history deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while deleting payment history with Id {PaymentHistoryId}", paymentHistoryId);
        }

        return serviceResponse;
    }

    // Deletes multiple payment history records by their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteMultiplePaymentHistoriesAsync(IEnumerable<Guid> paymentHistoryIds)
    {
        // Initialize response with default failure state and Data set to false
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete payment histories, please try again"
        };

        // Defensive check: validate that the input list is not null or empty
        if (paymentHistoryIds == null || !paymentHistoryIds.Any())
        {
            _logger.LogWarning("DeleteMultiplePaymentHistoriesAsync called with null or empty paymentHistoryIds");
            serviceResponse.Message = "No payment history IDs provided for deletion";
            return serviceResponse;
        }

        _logger.LogInformation("User {UserId} attempting to delete multiple payment histories: {Count} records", _userId, paymentHistoryIds.Count());

        try
        {
            // Retrieve all payment histories matching the given IDs from repository
            var paymentHistoriesToDelete = await _unitOfWork.PaymentHistoryRepo
                .GetByConditionAsync(w =>
                    paymentHistoryIds.Contains(w.Id) &&
                    w.TenantId == _tenantId)
                .ToListAsync();

            // Check if any payment histories were found to delete
            if (paymentHistoriesToDelete == null || !paymentHistoriesToDelete.Any())
            {
                _logger.LogWarning("No payment histories found matching provided IDs for deletion");
                serviceResponse.Message = "No matching payment histories found to delete";
                return serviceResponse;
            }

            // Delete each found payment history entity
            foreach (var paymentHistory in paymentHistoriesToDelete)
            {
                _unitOfWork.PaymentHistoryRepo.Delete(paymentHistory);
                _logger.LogInformation("Marked payment history with Id {PaymentHistoryId} for deletion", paymentHistory.Id);
            }

            // Persist all deletions in one transaction
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist multiple payment history deletions");
                return serviceResponse;
            }

            // Successfully deleted all requested records
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully deleted {paymentHistoriesToDelete.Count} payment histories";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while deleting multiple payment histories");
        }

        return serviceResponse;
    }
}