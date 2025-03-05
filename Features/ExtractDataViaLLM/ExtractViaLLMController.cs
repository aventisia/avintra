namespace MLModelBuilderAPIs.Controllers;

[Route("extract-via-llm")]
[ApiController]
[Authorize]
public class ExtractViaLLMController: BaseApiController
{
    private readonly IExtractViaLLMService _extractViaLLMService;

    public ExtractViaLLMController(IExtractViaLLMService extractViaLLMService)
    {
        _extractViaLLMService = extractViaLLMService;
    }

    // Extracts data via a Language Learning Model (LLM) asynchronously.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ExtractResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _extractViaLLMService.ExtractViaLLMAsync(extractRequestDto));
    }
}