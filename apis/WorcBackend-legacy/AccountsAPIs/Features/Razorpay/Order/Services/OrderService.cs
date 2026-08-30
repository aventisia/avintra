namespace AccountsAPIs.Services;

public class OrderService : IOrderService
{
    private readonly Razorpay.Api.RazorpayClient _razorpayClient;
    private readonly ILogger<OrderService> _logger;

    public OrderService(Razorpay.Api.RazorpayClient razorpayClient, ILogger<OrderService> logger)
    {
        _razorpayClient = razorpayClient;
        _logger = logger;
    }

    // Creates a new order in Razorpay using the provided order details.
    public async Task<ServiceResponse<OrderResponseDto>> CreateOrderAsync(OrderRequestDto request)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<OrderResponseDto>
        {
            Data = null,
            Message = "Failed to create order. Please try again."
        };

        try
        {
            // Prepare the dictionary for Razorpay API call to create an order
            var orderRequestOptions = new Dictionary<string, object>
                {
                    { "amount", request.Amount * 100 },
                    { "currency", request.Currency.ToString().ToUpper()},
                    { "receipt", request.Receipt ?? Guid.NewGuid().ToString() },
                };

            // Make API call to create the order
            var razorpayOrder = await Task.Run(() => _razorpayClient.Order.Create(orderRequestOptions));

            // Map the Razorpay response to OrderResponseDto for the API response
            var orderResponseDto = new OrderResponseDto
            {
                Id = razorpayOrder["id"].ToString(),
                Amount = int.Parse(razorpayOrder["amount"].ToString()) / 100,
                Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), razorpayOrder["currency"]?.ToString(), ignoreCase: true),
                Receipt = razorpayOrder["receipt"].ToString(),
                Status = razorpayOrder["status"].ToString()
            };

            // Set the success status code and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = orderResponseDto;
            serviceResponse.Message = "Order created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating order for Amount: {Amount}, Currency: {Currency}",
                             request.Amount, request.Currency);
        }

        // Return the service response (success or failure)
        return serviceResponse;
    }

    // Retrieves an existing order from Razorpay by its unique identifier.
    public async Task<ServiceResponse<OrderResponseDto>> GetOrderAsync(string orderId)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<OrderResponseDto>
        {
            Data = null,
            Message = "Failed to retrieve order data. Please try again."
        };

        try
        {

            // Call Razorpay API to fetch the order by ID
            var razorpayOrder = await Task.Run(() => _razorpayClient.Order.Fetch(orderId));


            // Map the Razorpay response to OrderResponseDto
            var orderResponseDto = new OrderResponseDto
            {
                Id = razorpayOrder["id"].ToString(),
                Amount = int.Parse(razorpayOrder["amount"].ToString()) / 100,
                Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), razorpayOrder["currency"]?.ToString(), ignoreCase: true),
                Receipt = razorpayOrder["receipt"].ToString(),
                Status = razorpayOrder["status"].ToString()
            };

            // Set the success status code and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = orderResponseDto;
            serviceResponse.Message = "Order retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching order with ID: {OrderId}", orderId);
        }

        // Return the service response (success or failure)
        return serviceResponse;
    }

    // Retrieves all orders from Razorpay.
    public async Task<ServiceResponse<List<OrderResponseDto>>> GetAllOrdersAsync()
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<List<OrderResponseDto>>
        {
            Data = null,
            Message = "Failed to retrieve order data. Please try again."
        };

        try
        {

            // Call Razorpay API to fetch all orders
            var razorpayOrders = await Task.Run(() => _razorpayClient.Order.All());

            // Map the Razorpay response (list of orders) to OrderResponseDto for the API response
            var orderList = razorpayOrders.Select(order => new OrderResponseDto
            {
                Id = order["id"].ToString(),
                Amount = int.Parse(order["amount"].ToString()) / 100,
                Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), order["currency"]?.ToString(), ignoreCase: true),
                Receipt = order["receipt"].ToString(),
                Status = order["status"].ToString()
            })
            .ToList();

            // Set the success status code and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = orderList;
            serviceResponse.Message = "All orders retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching all orders.");
        }

        // Return the service response (success or failure)
        return serviceResponse;
    }
}