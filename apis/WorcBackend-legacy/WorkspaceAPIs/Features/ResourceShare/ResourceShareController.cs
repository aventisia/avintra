namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("resource-share")]
public class ResourceShareController : BaseApiController
{
    private readonly IResourceShareService _resourceShareService;

    public ResourceShareController(IResourceShareService resourceShareService)
    {
        _resourceShareService = resourceShareService;
    }

    // Gets all resource shares assigned to the current user. Optional filtering by resource type.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ResourceShareDto>>>> GetMyResourceSharesAsync([FromQuery] ResourceTypeEnum? resourceType)
    {
        return ResultHelper(await _resourceShareService.GetMyResourceSharesAsync(resourceType));
    }

    // Gets all users who have access to a specific resource.
    [HttpGet("{resourceId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ResourceShareDto>>>> GetResourceSharesAsync(Guid resourceId)
    {
        return ResultHelper(await _resourceShareService.GetResourceSharesAsync(resourceId));
    }

    // Gets a specific resource share by ID.
    [HttpGet("{resourceShareId}")]
    public async Task<ActionResult<ServiceResponse<ResourceShareDto>>> GetResourceShareAsync(Guid resourceShareId)
    {
        return ResultHelper(await _resourceShareService.GetResourceShareByIdAsync(resourceShareId));
    }

    // Creates a new resource share and grants access to a user.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ResourceShareDto>>> CreateResourceShareAsync([FromBody] ResourceShareDto resourceShareDto)
    {
        return ResultHelper(await _resourceShareService.CreateResourceShareAsync(resourceShareDto));
    }

    // Creates resource shares and grants access to multiple users for the same resource.
    [HttpPost("bulk")]
    public async Task<ActionResult<ServiceResponse<bool>>> CreateBulkResourceShareAsync([FromBody] CreateResourceShareDto createResourceShareDto)
    {
        return ResultHelper(await _resourceShareService.CreateBulkResourceShareAsync(createResourceShareDto));
    }
    // Updates an existing resource share.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ResourceShareDto>>> UpdateResourceShareAsync([FromBody] ResourceShareDto resourceShareDto)
    {
        return ResultHelper(await _resourceShareService.UpdateResourceShareAsync(resourceShareDto));
    }

    //  Deletes a single resource share by ID.
    [HttpDelete("{resourceShareId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteResourceShareAsync(Guid resourceShareId)
    {
        return ResultHelper(await _resourceShareService.DeleteResourceShareAsync(resourceShareId));
    }

    // Deletes multiple resource shares by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteResourceSharesAsync([FromBody] IEnumerable<Guid> resourceShareIds)
    {
        return ResultHelper(await _resourceShareService.DeleteResourceSharesAsync(resourceShareIds));
    }
}