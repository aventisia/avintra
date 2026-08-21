namespace WorkspaceAPIs.Services;

public class PublicTemplateService : IPublicTemplateService
{
    private readonly ILogger<PublicTemplateService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public PublicTemplateService(
        ILogger<PublicTemplateService> logger,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a template by its unique identifier.
    public async Task<ServiceResponse<ProjectTemplateDto>> GetTemplateAsync(Guid templateId)
    {
        // Initial response setup indicating failure by default
        var serviceResponse = new ServiceResponse<ProjectTemplateDto>
        {
            Data = null,
            Message = "Failed to retrieve template. Please try again later."
        };

        try
        {
            // Query the template repository for the specific template by ID
            var template = await _unitOfWork.ProjectTemplateRepo
                .GetByConditionAsync(w => w.Id == templateId && w.Status == ProjectTemplateStatusesEnum.Approved)
                .Include(i => i.CreatedByUser)
                .Include(i => i.TemplateResources)
                .FirstOrDefaultAsync();

            // Check if the template was found, if not, log and return failure
            if (template == null)
            {
                _logger.LogWarning("Template with ID {TemplateId} not found.", templateId);
                serviceResponse.Message = "Template not found.";
                return serviceResponse;
            }

            // Map the template entity to the DTO (Data Transfer Object)
            serviceResponse.Data = template.Adapt<ProjectTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Catch any exceptions and log them
            _logger.LogError(ex, "An error occurred while fetching the template with ID {TemplateId}.", templateId);
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    // Searches templates by their name or description.
    public async Task<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>> SearchTemplatesAsync(string searchKey)
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<IEnumerable<SearchProjectTemplateDto>>
        {
            Data = null,
            Message = "Failed to search templates. Please try again."
        };

        try
        {
            // Query the template repository using a case-insensitive search on the name and description
            var templates = await _unitOfWork.ProjectTemplateRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower().Contains(searchKey.ToLower()) &&
                    w.Status == ProjectTemplateStatusesEnum.Approved &&
                    w.AccessType == TemplateAccessTypesEnum.Public &&
                    w.TenantId == null
                )
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .AsNoTracking()
                .ProjectToType<SearchProjectTemplateDto>()
                .ToListAsync();

            // Set the service response data with the list of matching templates
            serviceResponse.Data = templates;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Templates retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log any exceptions encountered during the search
            _logger.LogError(ex, "SearchTemplatesAsync: An error occurred while searching templates with key '{SearchKey}'", searchKey);
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    // Retrieves a list of trending templates based on usage.
    public async Task<ServiceResponse<IEnumerable<TrendingTemplateDto>>> GetAllTrendingTemplatesAsync()
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<IEnumerable<TrendingTemplateDto>>
        {
            Data = null,
            Message = "Failed to retrieve trending templates. Please try again later."
        };

        try
        {
            // Query the template repository for public templates and order by usage count (most popular first)
            var trendingTemplates = await _unitOfWork.ProjectTemplateRepo
                .GetByConditionAsync(w =>
                    w.Status == ProjectTemplateStatusesEnum.Approved &&
                    w.AccessType == TemplateAccessTypesEnum.Public &&
                    w.TenantId == null
                )
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderByDescending(o => o.UsageCount)
                .ToListAsync();

            // Map the result to the trending template DTOs
            serviceResponse.Data = trendingTemplates.Adapt<IEnumerable<TrendingTemplateDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Trending templates retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log any errors that occur while retrieving trending templates
            _logger.LogError(ex, "An error occurred while retrieving trending templates.");
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }
}