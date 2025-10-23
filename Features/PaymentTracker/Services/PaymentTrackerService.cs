namespace AccountsAPIs.Services
{
    public class PaymentTrackerService : IPaymentTrackerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PaymentTrackerService> _logger;
        private readonly Guid _userId;
        private readonly Guid _tenantId;

        public PaymentTrackerService(
            IUnitOfWork unitOfWork,
            ILogger<PaymentTrackerService> logger,
            IHttpContextAccessor httpContextAccessor
        )
        {
            _unitOfWork = unitOfWork;
            _logger = logger;

            // Extract user and tenant ID from JWT claims for audit and tracking purposes
            _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        }

        // Retrieves the payment tracker details for a given payment ID.
        public async Task<ServiceResponse<PaymentTrackerDto>> GetByPaymentIdAsync(string paymentId)
        {
            var serviceResponse = new ServiceResponse<PaymentTrackerDto>
            {
                Data = new PaymentTrackerDto() { RazorpayPaymentId = paymentId },
                Message = "Payment tracker retrieved successfully.",
                StatusCode = 200
            };

            try
            {
                // Retrieve payment history for the specified payment ID and tenant ID
                var paymentTracker = await _unitOfWork.PaymentHistoryRepo
                    .GetByConditionAsync(w => w.RazorpayPaymentId == paymentId && w.TenantId == _tenantId)
                    .FirstOrDefaultAsync();

                // If a payment tracker is found, update the DTO with its status
                if (paymentTracker != null)
                {
                    serviceResponse.Data.IsInitiated = true;

                    // Handle different payment statuses and update the DTO accordingly
                    switch (paymentTracker.Status)
                    {
                        case PaymentStatusTypesEnum.Authorized:
                            serviceResponse.Data.IsInitiated = true; 
                            break;
                        case PaymentStatusTypesEnum.Captured:
                            serviceResponse.Data.IsCollected = true; 
                            break;
                        case PaymentStatusTypesEnum.Failed:
                            serviceResponse.Data.Description = paymentTracker.Description;
                            break;
                        default:
                            break;
                    }
                }

                // Retrieve billing history for the specified payment ID and tenant ID
                var billingHistory = await _unitOfWork.BillingHistoryRepo
                    .GetByConditionAsync(w => w.RazorpayPaymentId == paymentId && w.TenantId == _tenantId)
                    .FirstOrDefaultAsync();

                // If billing history exists, update the DTO
                if (billingHistory != null)
                {
                    serviceResponse.Data.IsBillingCreated = true;
                    serviceResponse.Data.RazorpayOrderId = billingHistory.RazorpayOrderId;

                }

                // Retrieve tenant subscription related to the payment
                var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(w => w.RazorpaySubscriptionId == billingHistory.RazorpayPaymentId && w.TenantId == _tenantId)
                    .FirstOrDefaultAsync();

                // If tenant subscription exists, update the DTO
                if (tenantSubscription != null)
                {
                    serviceResponse.Data.RazorpaySubscriptionId = tenantSubscription.RazorpaySubscriptionId;
                }

                // Retrieve tenant credit details based on the subscription
                var tenantCredit = await _unitOfWork.TenantCreditRepo
                    .GetByConditionAsync(w => w.SubscriptionId == tenantSubscription.Id && w.CreditedOn.Date <= DateTimeOffset.UtcNow.Date)
                    .FirstOrDefaultAsync();

                // If tenant credit is found, mark the credit as updated
                if (tenantCredit != null)
                {
                    serviceResponse.Data.IsCreditUpdated = true;
                }

                // Set the final response data if everything is successful
                serviceResponse.Data = serviceResponse.Data;
                serviceResponse.Message = "Payment tracker details retrieved successfully.";
                serviceResponse.StatusCode = 200;
            }
            catch (Exception ex)
            {
                // Log any exceptions that occur during the processing
                _logger.LogError(ex, "An error occurred while retrieving the payment tracker for PaymentId: {PaymentId}", paymentId);
            }

            // Return the final service response
            return serviceResponse;
        }
    }
}
