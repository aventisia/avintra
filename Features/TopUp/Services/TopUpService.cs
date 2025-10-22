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
        public async Task<ServiceResponse<TopUpDto>> CreateTopUpAsync(TopUpDto topUpDto)
        {
            // Initialize service response with default failure message
            var serviceResponse = new ServiceResponse<TopUpDto>
            {
                Data = null,
                Message = "Failed to create the top-up request. Please try again."
            };

            try
            {
                // Log the details of the incoming top-up request for traceability
                _logger.LogInformation("Received top-up request. Amount: {Amount}, Currency: {Currency}, Credits: {Credits}, Include Tax: {IncludeTax}",
                                        topUpDto.Amount, topUpDto.Currency, topUpDto.Credits, topUpDto.IncludeTax);

                // Clean up string properties to remove unwanted leading/trailing spaces
                topUpDto = TrimDtoStringPropsUtil.TrimDtoStringProps(topUpDto);

                // Prepare the order request using the provided top-up details
                var orderRequest = new OrderRequestDto
                {
                    Amount = topUpDto.Amount,
                    Currency = topUpDto.Currency,
                    Receipt = $"{topUpDto.Credits}"
                };

                // Call the OrderService to create an order on Razorpay
                var orderResponse = await _orderService.CreateOrderAsync(orderRequest);

                // If order creation fails, log failure details and return an error response
                if (orderResponse.Data == null || orderResponse.StatusCode != 200)
                {
                    // Log the failure details including status code and error message
                    _logger.LogError("Order creation failed. Amount: {Amount}, Currency: {Currency}, Credits: {Credits}, StatusCode: {StatusCode}, Message: {Message}",
                                     topUpDto.Amount, topUpDto.Currency, topUpDto.Credits, orderResponse.StatusCode, orderResponse.Message);

                    // Set error message in the response
                    serviceResponse.Message = $"Order creation failed: {orderResponse.Message ?? "Please try again."}";
                    return serviceResponse;
                }

                // Update the top-up DTO with the Razorpay Order ID
                topUpDto.RazorpayId = orderResponse.Data.Id;

                // Fetch the most recent billing details for the tenant
                var existingBilling = await _unitOfWork.BillingDetailRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == _tenantId &&
                        string.IsNullOrEmpty(w.AddressLine1)
                    )
                    .OrderByDescending(o => o.CreatedOn)
                    .FirstOrDefaultAsync();

                // Fetch the active subscription for the tenant
                var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(w =>
                        w.IsActive && w.TenantId == _tenantId
                    )
                    .FirstOrDefaultAsync();

                // Create a new billing detail record for the top-up transaction
                var billingDetail = new BillingDetail()
                {
                    TenantId = _tenantId,
                    BillingEmail = existingBilling.BillingEmail,
                    ContactPerson = existingBilling.ContactPerson,
                    AddressLine1 = existingBilling.AddressLine1,
                    AddressLine2 = existingBilling.AddressLine2,
                    City = existingBilling.City,
                    State = existingBilling.State,
                    Country = existingBilling.Country,
                    PostalCode = existingBilling.PostalCode,
                    Currency = topUpDto.Currency,
                    Amount = topUpDto.Amount,
                    PaymentStatus = PaymentStatusTypesEnum.Created,
                    SubscriptionId = tenantSubscription.Id,
                    RazorpayOrderId = orderResponse.Data.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                };

                // Insert the billing detail into the database
                await _unitOfWork.BillingDetailRepo.InsertAsync(billingDetail);

                // Commit the transaction if insertion is successful
                if (!await _unitOfWork.SaveAsync())
                {
                    // Log failure in saving the transaction and return a response
                    _logger.LogError("Failed to save the top-up transaction for Amount: {Amount}, Currency: {Currency}", topUpDto.Amount, topUpDto.Currency);
                    return serviceResponse;
                }

                // Set success message and response data if everything succeeds
                serviceResponse.Data = topUpDto;
                serviceResponse.Message = "Top-up request successfully processed.";
                _logger.LogInformation("Top-up request successfully processed. Razorpay Order ID: {RazorpayOrderId}, Amount: {Amount}",
                                       topUpDto.RazorpayId, topUpDto.Amount);
            }
            catch (Exception ex)
            {
                // Log any exception that occurred during processing
                _logger.LogError(ex, "An error occurred while processing top-up transaction. Amount: {Amount}, Currency: {Currency}",
                                 topUpDto.Amount, topUpDto.Currency);
            }

            // Return the service response (success or failure)
            return serviceResponse;
        }
    }
}
