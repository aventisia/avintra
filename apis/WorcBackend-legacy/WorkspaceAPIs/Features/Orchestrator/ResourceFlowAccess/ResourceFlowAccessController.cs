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

    /// <summary>
    /// Retrieves the resources an agent uses, with who may share each and which recipients still need access.
    /// </summary>
    [HttpGet("{resourceType}/{resourceId}/linked-share-candidates")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<LinkedShareCandidateDto>>>> GetLinkedShareCandidates(ResourceTypeEnum resourceType, Guid resourceId, [FromQuery] string? userIds)
    {
        if (!TryParseUserIds(userIds, out var recipientIds))
        {
            return PlainTextError(400, "User identifiers are invalid.");
        }

        return ResultHelper(await _resourceFlowAccessService.GetLinkedShareCandidatesAsync(resourceType, resourceId, recipientIds));
    }

    private static bool TryParseUserIds(string? userIds, out List<Guid> recipientIds)
    {
        recipientIds = [];

        foreach (var value in (userIds ?? string.Empty).Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (!Guid.TryParse(value, out var userId))
            {
                return false;
            }

            if (userId != Guid.Empty)
            {
                recipientIds.Add(userId);
            }
        }

        return true;
    }
}
