namespace AccountsAPIs.Services;

public class CustomerService : ICustomerService
{
    private readonly Razorpay.Api.RazorpayClient _razorpayClient;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(Razorpay.Api.RazorpayClient razorpayClient, ILogger<CustomerService> logger)
    {
        _razorpayClient = razorpayClient;
        _logger = logger;
    }

    // Creates a new Razorpay customer using the provided customer details.
    public async Task<ServiceResponse<CustomerResponseDto>> CreateCustomerAsync(CustomerRequestDto customerDto)
    {
        // Initializing the service response with default error message
        var serviceResponse = new ServiceResponse<CustomerResponseDto>()
        {
            Data = null,
            Message = "Failed to create customer. Please try again.",
        };

        try
        {

            // Prepare customer data dictionary to send in the API request
            var customerRequest = new Dictionary<string, object>
                {
                    { "name", customerDto.Name },
                    { "email", customerDto.Email }
                };

            // Add optional contact field if provided by the customer
            if (!string.IsNullOrEmpty(customerDto.Contact))
            {
                customerRequest.Add("contact", customerDto.Contact);
            }

            // Add gst number field to the update request if it’s provided by the customer
            if (!string.IsNullOrEmpty(customerDto.GstNumber))
            {
                customerRequest.Add("gstin", customerDto.GstNumber);
            }

            // Call Razorpay API to create the customer
            var customer = await Task.Run(() => _razorpayClient.Customer.Create(customerRequest));


            // Map the response from Razorpay to the CustomerResponseDto object
            var createdCustomer = new CustomerResponseDto()
            {
                Id = customer["id"].ToString(),
                Name = customer["name"].ToString(),
                Email = customer["email"].ToString(),
                Contact = customer["contact"]?.ToString(),
                GstNumber = customer["gstin"]?.ToString(),
                CreatedAt = customer["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(customer["created_at"].ToString())) : null
            };

            // Assign the mapped customer DTO to the service response
            serviceResponse.Data = createdCustomer;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Customer created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating customer with Email: {CustomerEmail}", customerDto.Email);
        }

        // Return the service response with success or failure
        return serviceResponse;
    }

    // Retrieves a customer from Razorpay by their ID.
    public async Task<ServiceResponse<CustomerResponseDto>> GetCustomerByIdAsync(string customerId)
    {
        // Initializing the service response with default error message
        var serviceResponse = new ServiceResponse<CustomerResponseDto>
        {
            Data = null,
            Message = "Failed to retrieve customer data. Please try again.",
        };

        try
        {

            // Fetch the customer data from Razorpay API
            var customer = await Task.Run(() => _razorpayClient.Customer.Fetch(customerId));


            // Map the response from Razorpay to the CustomerResponseDto object
            var retrivedCustomer = new CustomerResponseDto()
            {
                Id = customer["id"].ToString(),
                Name = customer["name"].ToString(),
                Email = customer["email"].ToString(),
                Contact = customer["contact"]?.ToString(),
                GstNumber = customer["gstin"]?.ToString(),
                CreatedAt = customer["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(customer["created_at"].ToString())) : null
            };

            // Assign the mapped customer DTO to the service response
            serviceResponse.Data = retrivedCustomer;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Customer retrived successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching customer with ID: {CustomerId}", customerId);
        }

        // Return the service response with success or failure
        return serviceResponse;
    }

    // Retrieves all customers from Razorpay.
    public async Task<ServiceResponse<List<CustomerResponseDto>>> GetAllCustomersAsync()
    {
        // Initializing the service response with default error message
        var serviceResponse = new ServiceResponse<List<CustomerResponseDto>>
        {
            Data = new List<CustomerResponseDto>(),
            Message = "Failed to retrieve customer data. Please try again.",
        };

        try
        {

            // Call Razorpay API to fetch all customers
            var customers = await Task.Run(() => _razorpayClient.Customer.All());


            // Transform the raw customer data into a list of CustomerResponseDto objects
            var customerList = customers.Select(s => new CustomerResponseDto()
            {
                Id = s["id"].ToString(),
                Name = s["name"].ToString(),
                Email = s["email"].ToString(),
                Contact = s["contact"]?.ToString(),
                GstNumber = s["gstin"]?.ToString() ?? null,
                CreatedAt = s["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(s["created_at"].ToString())) : null
            }).ToList();

            // Map the transformed list of customers to the service response
            serviceResponse.Data = customerList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "All customers retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching all customers.");
        }

        // Return the service response with success or failure
        return serviceResponse;
    }

    // Updates a Razorpay customer using the provided customer ID and new data.
    public async Task<ServiceResponse<CustomerResponseDto>> UpdateCustomerAsync(string customerId, CustomerRequestDto customerDto)
    {
        // Initializing the service response with default error message
        var serviceResponse = new ServiceResponse<CustomerResponseDto>
        {
            Data = null,
            Message = "Failed to update customer. Please try again.",
        };

        try
        {

            // Prepare the update data dictionary
            var customerRequest = new Dictionary<string, object>
                {
                    { "name", customerDto.Name },
                    { "email", customerDto.Email }
                };

            // Add contact field to the update request if it’s provided by the customer
            if (!string.IsNullOrEmpty(customerDto.Contact))
            {
                customerRequest.Add("contact", customerDto.Contact);
            }

            // Add gst number field to the update request if it’s provided by the customer
            if (!string.IsNullOrEmpty(customerDto.GstNumber))
            {
                customerRequest.Add("gstin", customerDto.GstNumber);
            }

            // Fetch existing customer and update using the provided data
            var customer = await Task.Run(() =>
            {
                // Fetch the customer by ID
                var existingCustomer = _razorpayClient.Customer.Fetch(customerId);

                // Edit and update customer data
                return existingCustomer.Edit(customerRequest);
            });


            // Map the response from Razorpay to the CustomerResponseDto object
            var updatedCustomer = new CustomerResponseDto()
            {
                Id = customer["id"].ToString(),
                Name = customer["name"].ToString(),
                Email = customer["email"].ToString(),
                Contact = customer["contact"]?.ToString(),
                GstNumber = customer["gstin"]?.ToString(),
                CreatedAt = customer["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(customer["created_at"].ToString())) : null
            };

            // Assign the mapped customer DTO to the service response
            serviceResponse.Data = updatedCustomer;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Customer updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating customer with ID: {CustomerId}", customerId);
        }

        // Return the service response with success or failure
        return serviceResponse;
    }
}