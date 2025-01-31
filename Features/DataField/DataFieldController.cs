namespace MLModelBuilderAPIs.Controllers;

[Route("data-field")]
[ApiController]
[Authorize]
public class DataFieldController : BaseApiController
{
    #region Fields
    private readonly IDataFieldService _dataFieldService;

    #endregion

    #region  Constructors
    public DataFieldController(IDataFieldService dataFieldService)
    {
        _dataFieldService = dataFieldService;
    }

    #endregion

    #region Methods

    //Retrieve the list of fields
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<DataFieldDto>>>> GetDataFields(Guid mlModelId)
    {
        return ResultHelper(await _dataFieldService.GetDataFieldsAsync(mlModelId));
    }

    //Creates a new data field
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<DataFieldDto>>> InsertDataField([FromBody] DataFieldDto dataFieldDto)
    {
        return ResultHelper(await _dataFieldService.InsertDataFieldAsync(dataFieldDto));
    }

    //Updates a data field
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<DataFieldDto>>> UpdateDataField([FromBody] DataFieldDto dataFieldDto)
    {
        return ResultHelper(await _dataFieldService.UpdateDataFieldAsync(dataFieldDto));
    }

    //Deletes a data field permanently
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteDataField(Guid id)
    {
        return ResultHelper(await _dataFieldService.DeleteDataFieldAsync(id));
    }

    //Get a data field using identifier
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<DataFieldDto>>> GetDataFieldById(Guid id)
    {
        return ResultHelper(await _dataFieldService.GetDataFieldByIdAsync(id));
    }

    #endregion

}
