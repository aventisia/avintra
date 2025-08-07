namespace MLModelBuilderAPIs.Controllers;

[Route("user")]
[ApiController]
[Authorize]
public class ModelBuilderUserController : BaseApiController
{
    private readonly IModelBuilderUserService _userService;

    public ModelBuilderUserController(IModelBuilderUserService userService)
    {
        _userService = userService;
    }

    // Retrieves a model builder user by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<ModelBuilderUserDto>>> GetModelBuilderUser(Guid id)
    {
        return ResultHelper(await _userService.GetModelBuilderUserAsync(id));
    }

    // Get records is not required for ModelBuilderUser as other than user itself, 
    // no one required to see all users from InternalUser entity. Tenant manager 
    // will be able to see all users from AccountUser entity.

    // Insert new model builder record if does not exist already
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ModelBuilderUserDto>>> InsertModelBuilderUser([FromBody] ModelBuilderUserDto modelBuilderUserDto)
    {
        return ResultHelper(await _userService.InsertModelBuilderUserAsync(modelBuilderUserDto));
    }

    // Updates an existing model builder user.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ModelBuilderUserDto>>> UpdateModelBuilderUser([FromBody] ModelBuilderUserDto modelBuilderUserDto)
    {
        return ResultHelper(await _userService.UpdateModelBuilderUserAsync(modelBuilderUserDto));
    }

    // Deletes a model builder user by its ID.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteModelBuilderUser(Guid id)
    {
        return ResultHelper(await _userService.DeleteModelBuilderUserAsync(id));
    }

    // Searches for model build users matching the specified key.
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<bool>>> SearchModelBuilderUser(string searchKey)
    {
        return ResultHelper(await _userService.SearchModelBuilderUserAsync(searchKey));
    }
}