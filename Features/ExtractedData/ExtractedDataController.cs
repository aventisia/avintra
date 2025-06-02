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

    [HttpGet("list/{mlModelId}/{type}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractedDataDto>>>> GetExtractedDataList(Guid mlModelId, ExtractedDataType type)
    {
        return ResultHelper(await _extractedDataService.GetExtractedDataListAsync(mlModelId, type));
    }

    //Inserts an extracted data
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ExtractedDataDto>>> InsertExtractedData([FromBody] ExtractedDataDto extractedDataDto)
    {
        return ResultHelper(await _extractedDataService.InsertExtractedDataAsync(extractedDataDto));
    }

    //Updates an extracted data
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ExtractedDataDto>>> UpdateExtractedData([FromBody] ExtractedDataDto extractedDataDto)
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

    // Update extracted data silently in the background whenever the user makes any changes
    [HttpPut("silent-update")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateExtractedDataSilently([FromBody] ExtractedDataSilentUpdateDataDto extractedDataSilentUpdateDataDto)
    {
        return ResultHelper(await _extractedDataService.UpdateExtractedDataSilentlyAsync(extractedDataSilentUpdateDataDto));
    }

    // Deletes multiple extracted data entries based on the provided list of IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleExtractedData([FromBody] List<Guid> ids)
    {
        return ResultHelper(await _extractedDataService.DeleteMultipleExtractedDataAsync(ids));
    }

    #endregion

}