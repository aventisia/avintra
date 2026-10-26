namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("resource-user-access")]
public class ResourceUserAccessController : BaseApiController
{
    private readonly IResourceUserAccessService _resourceUserAccessService;

    public ResourceUserAccessController(IResourceUserAccessService resourceUserAccessService)
    {
        _resourceUserAccessService = resourceUserAccessService;
    }

    // Gets all resource user access records assigned to the current user. Optional filtering by resource type.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ResourceUserAccessDto>>>> GetMyResourceUserAccessesAsync([FromQuery] ResourceTypeEnum? resourceType)
    {
        return ResultHelper(await _resourceUserAccessService.GetMyResourceUserAccessesAsync(resourceType));
    }

    // Gets all users who have access to a specific resource.
    [HttpGet("{resourceId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ResourceUserAccessDto>>>> GetResourceUserAccessesAsync(Guid resourceId)
    {
        return ResultHelper(await _resourceUserAccessService.GetResourceUserAccessesAsync(resourceId));
    }

    // Gets a specific resource user access by ID.
    [HttpGet("{resourceUserAccessId}")]
    public async Task<ActionResult<ServiceResponse<ResourceUserAccessDto>>> GetResourceUserAccessAsync(Guid resourceUserAccessId)
    {
        return ResultHelper(await _resourceUserAccessService.GetResourceUserAccessByIdAsync(resourceUserAccessId));
    }

    // Creates a new resource user access and grants access to a user.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ResourceUserAccessDto>>> CreateResourceUserAccessAsync([FromBody] ResourceUserAccessDto resourceUserAccessDto)
    {
        return ResultHelper(await _resourceUserAccessService.CreateResourceUserAccessAsync(resourceUserAccessDto));
    }

    // Creates resource user access records and grants access to multiple users for the same resource.
    [HttpPost("bulk")]
    public async Task<ActionResult<ServiceResponse<bool>>> CreateBulkResourceUserAccessAsync([FromBody] CreateResourceUserAccessDto createResourceUserAccessDto)
    {
        return ResultHelper(await _resourceUserAccessService.CreateBulkResourceUserAccessAsync(createResourceUserAccessDto));
    }
    // Updates an existing resource user access.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ResourceUserAccessDto>>> UpdateResourceUserAccessAsync([FromBody] ResourceUserAccessDto resourceUserAccessDto)
    {
        return ResultHelper(await _resourceUserAccessService.UpdateResourceUserAccessAsync(resourceUserAccessDto));
    }

    // Removes the current user's access to the specified resource.
    [HttpDelete("{resourceId}/my-access")]
    public async Task<ActionResult<ServiceResponse<bool>>> RevokeMyAccessAsync(Guid resourceId)
    {
        return ResultHelper(await _resourceUserAccessService.RevokeMyAccessAsync(resourceId));
    }

    //  Deletes a single resource user access by ID.
    [HttpDelete("{resourceUserAccessId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteResourceUserAccessAsync(Guid resourceUserAccessId)
    {
        return ResultHelper(await _resourceUserAccessService.DeleteResourceUserAccessAsync(resourceUserAccessId));
    }

    // Deletes multiple resource user access records by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteResourceUserAccessesAsync([FromBody] IEnumerable<Guid> resourceUserAccessIds)
    {
        return ResultHelper(await _resourceUserAccessService.DeleteResourceUserAccessesAsync(resourceUserAccessIds));
    }

    // Enables or disables tenant-wide access for a specific resource
    [HttpPut("tenant-access")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateTenantWideAccessAsync([FromBody] UpdateTenantWideAccessDto updateTenantWideAccessDto)
    {
        return ResultHelper(await _resourceUserAccessService.UpdateTenantWideAccessAsync(updateTenantWideAccessDto));
    }
}