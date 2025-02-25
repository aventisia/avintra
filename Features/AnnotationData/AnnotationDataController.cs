namespace MLModelBuilderAPIs.Controllers;

[Route("annotation-data")]
[ApiController]
[Authorize]
public class AnnotationDataController : BaseApiController
{
    #region Fields
    private readonly IAnnotationDataService _annotationDataService;

    #endregion

    #region  Constructors
    public AnnotationDataController(IAnnotationDataService annotationDataService)
    {
        _annotationDataService = annotationDataService;
    }

    #endregion

    #region Methods

    //Retrieve the list of annotation data
    [HttpGet("list/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AnnotationDataDto>>>> GetAnnotationDataList(Guid mlModelId)
    {
        return ResultHelper(await _annotationDataService.GetAnnotationDataListAsync(mlModelId));
    }

    //Creates a new annotation data
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AnnotationDataDto>>> InsertAnnotationData([FromBody] AnnotationDataDto annotationDataDto)
    {
        return ResultHelper(await _annotationDataService.InsertAnnotationDataAsync(annotationDataDto));
    }

    //Updates an annotation data
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AnnotationDataDto>>> UpdateAnnotationData([FromBody] AnnotationDataDto annotationDataDto)
    {
        return ResultHelper(await _annotationDataService.UpdateAnnotationDataAsync(annotationDataDto));
    }

    //Deletes an annotation data permanently
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAnnotationData(Guid id)
    {
        return ResultHelper(await _annotationDataService.DeleteAnnotationDataAsync(id));
    }

    //Get an annotation data using identifier
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<AnnotationDataDto>>> GetAnnotationDataById(Guid id)
    {
        return ResultHelper(await _annotationDataService.GetAnnotationDataByIdAsync(id));
    }

    #endregion

}
