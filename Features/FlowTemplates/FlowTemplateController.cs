namespace WorkspaceAPIs.Controllers;

[Route("flow-template")]
[ApiController]
[Authorize]
public class FlowTemplateController : BaseApiController
{
    private readonly IFlowTemplateService _flowTemplateService;

    public FlowTemplateController(IFlowTemplateService flowTemplateService)
    {
        _flowTemplateService = flowTemplateService;
    }
    
   // Create a new flow template
   [HttpPost("create-template")]
   public async Task<ActionResult<ServiceResponse<FlowTemplateDto>>> CreateFlowTemplate([FromBody]FlowTemplateDto flowTemplateDto)
   {
    return ResultHelper(await _flowTemplateService.CreateFlowTemplateAsync(flowTemplateDto));
   }

    // Fetching flow template by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<FlowTemplateDto>>> GetFlowTemplate(Guid TemplateId)
    {
        return ResultHelper(await _flowTemplateService.GetFlowTemplateAsync(TemplateId));
    }

    // Fetching trending templates list
    [HttpGet("trending-templates")]
     public async Task<ActionResult<ServiceResponse<IEnumerable<FlowTemplateDto>>>> GetTrendingTemplates()
     {
        return ResultHelper(await _flowTemplateService.GetTrendingTemplatesAsync());
     }
    
}