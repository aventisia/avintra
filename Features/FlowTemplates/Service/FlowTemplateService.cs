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
    public async Task<ServiceResponse<FlowTemplateDto>> CreateFlowTemplateAsync(FlowTemplateDto flowTemplateDto)
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
            var flowTemplate = await _unitOfWork.flowTemplateRepo.GetByConditionAsync(w => w.TemplateId == TemplateId).FirstOrDefaultAsync();

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

    public async Task<ServiceResponse<IEnumerable<FlowTemplateDto>>> GetTrendingTemplatesAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowTemplateDto>>
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
              if(trendingTemplates== null)
              {
                _logger.LogInformation("No trending templates found.");
                serviceResponse.Message = "No trending templates found for the user.";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
              }

            // Task successful
            serviceResponse.Data = trendingTemplates.Adapt<IEnumerable<FlowTemplateDto>>();
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
}