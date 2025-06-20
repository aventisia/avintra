namespace MLModelBuilderAPIs.Services;

public class AIModelService : IAIModelService
{
    private readonly ILogger<AIModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public AIModelService(
        ILogger<AIModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Attempt to extract the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves a list of published ai models.
    public async Task<ServiceResponse<IEnumerable<AIModelDto>>> GetAIModelsAsync()
    {
        _logger.LogInformation("Initiating retrieval of published ai models for user: {UserId}", _userId);

        var response = new ServiceResponse<IEnumerable<AIModelDto>>
        {
            Data = null,
            Message = "Failed to retrieve ai models. Please try again later.",
        };

        try
        {
            _logger.LogDebug("Querying the repository for published ai models...");

            var models = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.IsPublished)
                .ProjectToType<AIModelDto>()
                .ToListAsync();

            _logger.LogDebug("Query completed. {Count} models found.", models.Count);

            response.Data = models;
            response.StatusCode = 200;
            response.Message = "AI models retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {Count} ai models for user {UserId}.", models.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving ai models for user {UserId}.", _userId);
        }

        return response;
    }
}
