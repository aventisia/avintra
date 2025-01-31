namespace MLModelBuilderAPIs.Controllers;

[Route("extracted-data")]
[ApiController]
[Authorize]
public class ExtractedDataController : BaseApiController
{
    #region Fields
    private readonly IExtractedDataService _extractedDataService;

    #endregion

    #region  Constructors
    public ExtractedDataController(IExtractedDataService extractedDataService)
    {
        _extractedDataService = extractedDataService;
    }

    #endregion

    #region Methods

    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractedDataDto>>>> GetExtractedDataList(Guid mlModelId)
    {
        return ResultHelper(await _extractedDataService.GetExtractedDataListAsync(mlModelId));
    }

    //Inserts an extracted data
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ExtractedDataDto>>> InsertModelLibrary([FromBody] ExtractedDataDto extractedDataDto)
    {
        return ResultHelper(await _extractedDataService.InsertExtractedDataAsync(extractedDataDto));
    }

    //Updates an extracted data
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ExtractedDataDto>>> UpdateMLModel([FromBody] ExtractedDataDto extractedDataDto)
    {
        return ResultHelper(await _extractedDataService.UpdateExtractedDataAsync(extractedDataDto));
    }

    //Deletes extracted data permanently
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteExtractedData(Guid id)
    {
        return ResultHelper(await _extractedDataService.DeleteExtractedDataAsync(id));
    }

    //Get an extracted data using identifier
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<ExtractedDataDto>>> GetExtractedDataById(Guid id)
    {
        return ResultHelper(await _extractedDataService.GetExtractedDataByIdAsync(id));
    }

    #endregion

}