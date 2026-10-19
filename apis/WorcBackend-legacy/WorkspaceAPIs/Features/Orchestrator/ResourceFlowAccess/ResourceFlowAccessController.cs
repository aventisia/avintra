namespace WorkspaceAPIs.Controllers;

[Route("resource-flows")]
[ApiController]
[Authorize]
public class ResourceFlowAccessController : BaseApiController
{
    private readonly IResourceFlowAccessService _resourceFlowAccessService;

    public ResourceFlowAccessController(IResourceFlowAccessService resourceFlowAccessService)
    {
        _resourceFlowAccessService = resourceFlowAccessService;
    }

    /// <summary>
    /// Assigns the given flows to a resource, replacing the existing assignment set.
    /// </summary>
    [HttpPost("assign")]
    public async Task<ActionResult<ServiceResponse<AssignResourceFlowsResultDto>>> AssignFlows([FromBody] AssignResourceFlowsDto assignResourceFlowsDto)
    {
        return ResultHelper(await _resourceFlowAccessService.AssignFlowsAsync(
            assignResourceFlowsDto.ResourceType,
            assignResourceFlowsDto.ResourceId,
            assignResourceFlowsDto.FlowIds));
    }

    /// <summary>
    /// Retrieves the flows currently assigned to a resource.
    /// </summary>
    [HttpGet("{resourceType}/{resourceId}/assigned-flows")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ResourceAssignedFlowDto>>>> GetAssignedFlows(ResourceTypeEnum resourceType, Guid resourceId)
    {
        return ResultHelper(await _resourceFlowAccessService.GetAssignedFlowsAsync(resourceType, resourceId));
    }
}
