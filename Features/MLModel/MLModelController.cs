

namespace MLModelBuilderAPIs.Controllers;

[Route("ml-model")]
[ApiController]
[Authorize]   
public class MLModelController : BaseApiController
{
  private readonly IMLModelService _mlModelService;

  public MLModelController(IMLModelService mlModelService)
  {
    _mlModelService = mlModelService;
  }

  [HttpGet("list")]
  public async Task<ActionResult<ServiceResponse<IEnumerable<MLModelDto>>>> GetMLModelList()
  {
    return ResultHelper(await _mlModelService.GetMLModelListAsync());
  }

  [HttpPost("is-available")]
  public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsMLModelNameAvailable(CheckAvailabilityDto checkAvailabilityDto)
  {
    return ResultHelper(await _mlModelService.IsMLModelNameAvailableAsync(checkAvailabilityDto));
  }

  //Inserts a new ML model
  [HttpPost]
  public async Task<ActionResult<ServiceResponse<MLModelDto>>> InsertMLModel([FromBody] MLModelDto mlModelDto)
  {
    return ResultHelper(await _mlModelService.InsertMLModelAsync(mlModelDto));
  }

  //Update a ML model
  [HttpPut]
  public async Task<ActionResult<ServiceResponse<MLModelDto>>> UpdateMLModel([FromBody] MLModelDto mlModelDto)
  {
    return ResultHelper(await _mlModelService.UpdateMLModelAsync(mlModelDto));
  }

  //Deletes a ML model permanently
  [HttpDelete("{id}")]
  public async Task<ActionResult<ServiceResponse<bool>>> DeleteMLModel(Guid id)
  {
    return ResultHelper(await _mlModelService.DeleteMLModelAsync(id));
  }

  //Get a ML model using identifier
  [HttpGet("{id}")]
  public async Task<ActionResult<ServiceResponse<MLModelDto>>> GetMLModelById(Guid id)
  {
    return ResultHelper(await _mlModelService.GetMLModelByIdAsync(id));
  }

}