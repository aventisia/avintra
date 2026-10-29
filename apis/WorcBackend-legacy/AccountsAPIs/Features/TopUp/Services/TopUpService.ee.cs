namespace AccountsAPIs.Services
{
    public class TopUpService : ITopUpService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly Razorpay.Api.RazorpayClient _razorpayClient;
        private readonly ILogger<TopUpService> _logger;
        private readonly IOrderService _orderService;
        private readonly Guid _userId;
        private readonly Guid _tenantId;

        public TopUpService(
            IUnitOfWork unitOfWork,
            ILogger<TopUpService> logger,
            IHttpContextAccessor httpContextAccessor,
            Razorpay.Api.RazorpayClient razorpayClient,
            IOrderService orderService
            )
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _razorpayClient = razorpayClient;
            _orderService = orderService;

            // Extract user ID from JWT token claims for audit purposes (Logging user actions)
            _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

            // Extract tenant ID from JWT token claims to tie actions to the correct tenant
            _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        }

        // Initiates a new top-up transaction based on the provided top-up details.
        public async Task<ServiceResponse<RazorpayOrderRequestDto>> CreateTopUpAsync(RazorpayOrderRequestDto razorpayOrderRequestDto)
        {
            // Initialize service response with default failure message
            var serviceResponse = new ServiceResponse<RazorpayOrderRequestDto>
            {
                Data = null,
                Message = "Failed to create the top-up request. Please try again."
            };

            try
            {
                // Clean up string properties to remove unwanted leading/trailing spaces
                razorpayOrderRequestDto = TrimDtoStringPropsUtil.TrimDtoStringProps(razorpayOrderRequestDto);

                // Fetch tenant information based on tenant ID
                var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstOrDefaultAsync();

                // Check if the tenant was found
                if (tenant == null)
                {
                    // Return an error message if the tenant is not found
                    serviceResponse.Message = "Tenant not found";
                    return serviceResponse;
                }


                // Retrieve the tenant's subscription based on the provided tenant ID and ensure the subscription is active.
                var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == tenant.Id &&
                        w.IsActive
                    )
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

                // Check if the subscription is either not found or the next billing date is in the past.
                if (razorpayOrderRequestDto.Type == CreditTypesEnum.TopUp && (tenantSubscription == null || tenantSubscription.NextBillingDate.Date < DateTimeOffset.UtcNow.Date))
                {
                    _logger.LogWarning("Subscription not found or next billing date has passed for SubscriptionId: {SubscriptionId}", razorpayOrderRequestDto.SubscriptionId);
                    serviceResponse.Message = "Your subscription has expired. Please renew it before attempting to top up.";
                    return serviceResponse;
                }

                // Check if the tenant is from India and if the credit type is 'Subscription'
                if (tenant.Country == CountriesEnum.India && razorpayOrderRequestDto.Type == CreditTypesEnum.Subscription)
                {
                    // Apply a default tax rate of 18% (represented as 1.18) for subscriptions in India
                    decimal defaultTaxRate = 1.18m;

                    // Adjust the amount by multiplying it by the tax rate
                    razorpayOrderRequestDto.Amount = Math.Round(razorpayOrderRequestDto.Amount * defaultTaxRate, 2);
                }

                // Prepare the order request using the provided top-up details
                var orderRequest = new OrderRequestDto
                {
                    Amount = razorpayOrderRequestDto.Amount,
                    Currency = razorpayOrderRequestDto.Currency,
                    Receipt = $"{razorpayOrderRequestDto.Credits}"
                };

                // Call the OrderService to create an order on Razorpay
                var orderResponse = await _orderService.CreateOrderAsync(orderRequest);

                // If order creation fails, log failure details and return an error response
                if (orderResponse.Data == null || orderResponse.StatusCode != 200)
                {
                    _logger.LogError("Order creation failed. Amount: {Amount}, Currency: {Currency}, Credits: {Credits}, StatusCode: {StatusCode}, Message: {Message}",
                                     razorpayOrderRequestDto.Amount, razorpayOrderRequestDto.Currency, razorpayOrderRequestDto.Credits, orderResponse.StatusCode, orderResponse.Message);

                    // Set error message in the response
                    serviceResponse.Message = $"Order creation failed: {orderResponse.Message ?? "Please try again."}";
                    return serviceResponse;
                }

                // Update the top-up DTO with the Razorpay Order ID
                razorpayOrderRequestDto.RazorpayId = orderResponse.Data.Id;

                // Fetch the most recent billing details for the tenant
                var existingBilling = await _unitOfWork.BillingDetailRepo
                    .GetByConditionAsync(w => w.TenantId == _tenantId)
                    .OrderByDescending(o => o.CreatedOn)
                    .FirstOrDefaultAsync();

                // Check if existingBilling is null
                if (existingBilling == null)
                {
                    _logger.LogError("No existing billing details found for tenant: {TenantId}", _tenantId);
                    serviceResponse.Message = "No existing billing details found for the tenant.";
                    return serviceResponse;
                }

                // Create a new billing detail record for the top-up transaction
                var billingHistory = new BillingHistory()
                {
                    TenantId = _tenantId,
                    BillingDetailId = existingBilling.Id,
                    Currency = razorpayOrderRequestDto.Currency,
                    Amount = razorpayOrderRequestDto.Amount,
                    Type = razorpayOrderRequestDto.Type,
                    Quantity = razorpayOrderRequestDto.Credits,
                    PaymentStatus = PaymentStatusTypesEnum.Created,
                    RazorpayOrderId = razorpayOrderRequestDto.RazorpayId,
                    SubscriptionId = razorpayOrderRequestDto.SubscriptionId,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                };

                // Insert the billing history into the database
                await _unitOfWork.BillingHistoryRepo.InsertAsync(billingHistory);

                // Commit the transaction if insertion is successful
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save the top-up transaction for Amount: {Amount}, Currency: {Currency}", razorpayOrderRequestDto.Amount, razorpayOrderRequestDto.Currency);
                    return serviceResponse;
                }

                // Set success message and response data if everything succeeds
                serviceResponse.Data = razorpayOrderRequestDto;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Top-up request successfully processed.";
                _logger.LogInformation("Top-up request successfully processed. Razorpay Order ID: {RazorpayOrderId}, Amount: {Amount}",
                                       razorpayOrderRequestDto.RazorpayId, razorpayOrderRequestDto.Amount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing top-up transaction. Amount: {Amount}, Currency: {Currency}",
                                 razorpayOrderRequestDto.Amount, razorpayOrderRequestDto.Currency);
            }

            // Return the service response (success or failure)
            return serviceResponse;
        }
    }
}