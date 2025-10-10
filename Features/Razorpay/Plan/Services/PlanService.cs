namespace AccountsAPIs.Services;

public class PlanService : IPlanService
{
    private readonly Razorpay.Api.RazorpayClient _razorpayClient;
    private readonly ILogger<PlanService> _logger;

    public PlanService(Razorpay.Api.RazorpayClient razorpayClient, ILogger<PlanService> logger)
    {
        _razorpayClient = razorpayClient;
        _logger = logger;
    }

    // Creates a new subscription plan using the provided plan details
    public async Task<ServiceResponse<PlanResponseDto>> CreatePlanAsync(PlanRequestDto request)
    {
        // Initializing the service response with a default error message
        var serviceResponse = new ServiceResponse<PlanResponseDto>
        {
            Data = null,
            Message = "Failed to create subscription plan. Please try again.",
        };

        try
        {
            // Logging the start of the plan creation process with provided details
            _logger.LogInformation("Starting CreatePlanAsync for Plan: {PlanName}, Period: {Period}, Interval: {Interval}",
                request.Item.Name, request.Period, request.Interval);

            // Check if required fields (name, amount) are provided and valid
            if (request.Item == null || string.IsNullOrEmpty(request.Item.Name) || request.Item.Amount <= 0)
            {
                _logger.LogWarning("Invalid plan data: Plan name or amount is missing or invalid.");
                serviceResponse.Message = "Invalid plan data. Name and Amount are required.";
                return serviceResponse;
            }

            // Prepare the request dictionary for creating a new plan
            var planRequest = new Dictionary<string, object>
            {
                { "period", request.Period },
                { "interval", request.Interval },
                { "notes", request.Notes ?? new Dictionary<string, string>() },
                { "item", new Dictionary<string, object>
                    {
                        { "name", request.Item.Name },
                        { "description", request.Item.Description ?? string.Empty },
                        { "amount", request.Item.Amount },
                        { "currency", request.Item.Currency }
                    }
                }
            };

            // Log the request details sent to Razorpay (excluding sensitive data)
            _logger.LogDebug("Prepared plan creation request: PlanName={PlanName}, Amount={Amount}, Currency={Currency}, Notes={Notes}",
                request.Item.Name, request.Item.Amount, request.Item.Currency, request.Notes);

            // Call Razorpay API to create the plan
            var plan = await Task.Run(() => _razorpayClient.Plan.Create(planRequest));

            // Log successful plan creation with the plan name
            _logger.LogInformation("Subscription plan created successfully with Name: {PlanName}", request.Item.Name);

            // Map the response from Razorpay to PlanResponseDto
            var createdPlan = new PlanResponseDto
            {
                Id = plan["id"].ToString(),
                Period = plan["period"].ToString(),
                Interval = int.Parse(plan["interval"].ToString()),
                Item = new PlanItemDto
                {
                    Name = plan["item"]?["name"]?.ToString(),
                    Amount = int.Parse(plan["item"]?["amount"]?.ToString() ?? "0"),
                    Currency = plan["item"]?["currency"]?.ToString(),
                },
                Notes = plan["notes"] != null ? plan["notes"].ToObject<Dictionary<string, string>>() : new Dictionary<string, string>(),
                CreatedAt = plan["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(plan["created_at"].ToString())) : null
            };

            // Set the service response data and success message
            serviceResponse.Data = createdPlan;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plan created successfully";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the plan creation process
            _logger.LogError(ex, "Error occurred while creating plan: {PlanName}, Period: {Period}, Interval: {Interval}",
                request.Item.Name, request.Period, request.Interval);
        }

        return serviceResponse;
    }

    // Retrieves a subscription plan by its ID from Razorpay
    public async Task<ServiceResponse<PlanResponseDto>> GetPlanByIdAsync(string planId)
    {
        // Initializing the service response with a default error message
        var serviceResponse = new ServiceResponse<PlanResponseDto>
        {
            Data = null,
            Message = "Failed to retrieve subscription plan. Please try again.",
        };

        try
        {
            // Log the request to fetch a specific plan by ID
            _logger.LogInformation("Fetching plan with ID: {PlanId}", planId);

            // Fetch the plan data from Razorpay API
            var plan = await Task.Run(() => _razorpayClient.Plan.Fetch(planId));

            // Log successful retrieval of the plan
            _logger.LogInformation("Subscription plan fetched successfully with ID: {PlanId}", planId);

            // Map the response from Razorpay to PlanResponseDto
            var retrievedPlan = new PlanResponseDto
            {
                Id = plan["id"].ToString(),
                Period = plan["period"].ToString(),
                Interval = int.Parse(plan["interval"].ToString()),
                Item = new PlanItemDto
                {
                    Name = plan["item"]?["name"]?.ToString(),
                    Amount = int.Parse(plan["item"]?["amount"]?.ToString() ?? "0"),
                    Currency = plan["item"]?["currency"]?.ToString(),
                },
                Notes = plan["notes"] != null ? plan["notes"].ToObject<Dictionary<string, string>>() : new Dictionary<string, string>(),
                CreatedAt = plan["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(plan["created_at"].ToString())) : null
            };

            // Set the service response data and success message
            serviceResponse.Data = retrievedPlan;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plan retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the plan retrieval process
            _logger.LogError(ex, "Error occurred while fetching plan with ID: {PlanId}", planId);
        }

        return serviceResponse;
    }

    // Retrieves all subscription plans from Razorpay
    public async Task<ServiceResponse<List<PlanResponseDto>>> GetAllPlansAsync()
    {
        // Initializing the service response with a default error message
        var serviceResponse = new ServiceResponse<List<PlanResponseDto>>
        {
            Data = new List<PlanResponseDto>(),
            Message = "Failed to retrieve plans. Please try again.",
        };

        try
        {
            // Log the request to fetch all plans
            _logger.LogInformation("Fetching all subscription plans from Razorpay");

            // Fetch all plans from Razorpay API
            var plans = await Task.Run(() => _razorpayClient.Plan.All());

            // Log the number of plans fetched
            _logger.LogInformation("Successfully fetched {Count} subscription plans", plans.Count);

            // Map the response from Razorpay to List of PlanResponseDto
            var retrievedPlanList = plans.Select(plan => new PlanResponseDto
            {
                Id = plan["id"].ToString(),
                Period = plan["period"].ToString(),
                Interval = int.Parse(plan["interval"].ToString()),
                Item = new PlanItemDto
                {
                    Name = plan["item"]?["name"]?.ToString(),
                    Amount = int.Parse(plan["item"]?["amount"]?.ToString() ?? "0"),
                    Currency = plan["item"]?["currency"]?.ToString()
                },
                Notes = plan["notes"] != null ? plan["notes"].ToObject<Dictionary<string, string>>() : new Dictionary<string, string>(),
                CreatedAt = plan["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(plan["created_at"].ToString())) : null
            }).ToList();

            // Set the service response data and success message
            serviceResponse.Data = retrievedPlanList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plans retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the fetch of all plans
            _logger.LogError(ex, "Error occurred while fetching all plans.");
        }

        return serviceResponse;
    }
}