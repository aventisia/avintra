namespace WorkspaceAPIs.Services;

public class FlowTemplateService : IFlowTemplateService
{
    private readonly ILogger<FlowTemplateService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFlowTemplateService _flowTemplateService;
    private readonly Guid _userId;

    public FlowTemplateService(
        ILogger<FlowTemplateService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Creates a new flow template
    public async Task<ServiceResponse<FlowTemplateDto>> InsertFlowTemplateAsync(FlowTemplateDto flowTemplateDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowTemplateDto>
        {
            Data = null,
            Message = "Failed to add template. Please try again"
        };
        try
        {
            // Trim dto' string props
            flowTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowTemplateDto);

            // Map the DTO to the entity
            var newFlowTemplate = flowTemplateDto.Adapt<FlowTemplate>();
            newFlowTemplate.CreatedByUserId = _userId;
            newFlowTemplate.LastModifiedByUserId = _userId;

            // Insert flow template into the database

            await _unitOfWork.flowTemplateRepo.InsertAsync(newFlowTemplate);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new flow template");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowTemplate.Adapt<FlowTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occured while insert the flow template";
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Publish flow as a template
    public async Task<ServiceResponse<FlowTemplateDto>> PublishFlowAsTemplateAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowTemplateDto>
        {
            Data = null,
            Message = "Failed to publish flow as template. Please try again"
        };
        try
        {
            var flow = await _unitOfWork.FlowRepo.GetByConditionAsync(w => w.Id == flowId).FirstOrDefaultAsync();
            if (flow == null)
            {
                _logger.LogError($"Flow not found for Id:{flowId}");
                serviceResponse.Message = "flow does not exist";
                return serviceResponse;
            }
            // Trim dto string props
            var trimmedFlow = TrimDtoStringPropsUtil.TrimDtoStringProps(flow);

            // Map the DTO to the entity
            var newFlowTemplate = trimmedFlow.Adapt<FlowTemplate>();
            newFlowTemplate.Type = CategoryTypesEnum.CategoryType1;
            newFlowTemplate.CreatedByUserId = _userId;
            newFlowTemplate.LastModifiedByUserId = _userId;

            // Insert flow template into the database
            await _unitOfWork.flowTemplateRepo.InsertAsync(newFlowTemplate);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while publishing flow as a template");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowTemplate.Adapt<FlowTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Publish flow as a template successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occured while publishing flow as template";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Retrive flow template by its Id
    public async Task<ServiceResponse<FlowTemplateDto>> GetFlowTemplateAsync(Guid TemplateId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowTemplateDto>
        {
            Data = null,
            Message = "Failed to get flow template. Please try again"
        };
        try
        {
            // Try to get flow-template
            var flowTemplate = await _unitOfWork.flowTemplateRepo.GetByConditionAsync(w => w.Id == TemplateId).FirstOrDefaultAsync();

            if (flowTemplate == null)
            {
                _logger.LogError($"Flow template not found for Id {TemplateId}");
                serviceResponse.Message = "Flow template does not exist";
                return serviceResponse;
            }

            // Task Successful
            serviceResponse.Data = flowTemplate.Adapt<FlowTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow template fetching successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occured while fetching flow template";
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrive flow template list
    public async Task<ServiceResponse<IEnumerable<TrendingFlowTemplateDto>>> GetTrendingTemplatesAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<TrendingFlowTemplateDto>>
        {
            Data = null,
            Message = "Failed to get trending templates,Please try again"
        };
        try
        {
            // Try to get trending templates list 
            var trendingTemplates = await _unitOfWork.flowTemplateRepo
              .GetAllAsync()
              .OrderByDescending(o => o.UsagesCount)
              .ToListAsync();

            // Check condition if trending templates
            if (trendingTemplates == null)
            {
                _logger.LogInformation("No trending templates found.");
                serviceResponse.Message = "No trending templates found for the user.";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = trendingTemplates.Adapt<IEnumerable<TrendingFlowTemplateDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Trending templates retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occured while fetching trending templates";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Retrive template based on category and search query
    public async Task<ServiceResponse<IEnumerable<FlowTemplateCategoryBySearchQueryDto>>> GetFlowTemplateCategoryBySearchQueryAsync(CategoryTypesEnum Type, string Name)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowTemplateCategoryBySearchQueryDto>>
        {
            Data = null,
            Message = "Failed to get flow template category by search query. Please try again"
        };

        try
        {
            // Fetch all templates and filter based on category and search query
            var templates = await _unitOfWork.flowTemplateRepo.GetByConditionAsync(t => t.Type == Type && t.Name == Name)
                .Select(t => new FlowTemplateCategoryBySearchQueryDto
                {
                    Type = t.Type,
                    Name = t.Name
                }).ToListAsync();

            // Check condition if trending templates
            if (templates == null)
            {
                _logger.LogInformation("No flow templates category by search query found.");
                serviceResponse.Message = "No flow templates category by name found for the user.";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = templates.Adapt<IEnumerable<FlowTemplateCategoryBySearchQueryDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully fetched flow template category by search query.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurred while fetching flow template category by search query.";
        }

        return serviceResponse;
    }


}