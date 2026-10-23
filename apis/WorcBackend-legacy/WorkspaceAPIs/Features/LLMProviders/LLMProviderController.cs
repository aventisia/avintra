namespace WorkspaceAPIs.Controllers;

[Route("llm-provider")]
[ApiController]
public class LLMProviderController : BaseApiController
{
    private readonly ILLMProviderService _llmProviderService;

    public LLMProviderController(ILLMProviderService llmProviderService)
    {
        _llmProviderService = llmProviderService;
    }

    // Get models for a specific LLM provider
    [HttpGet("models/select-option")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetAllVaultCredentials([FromQuery] LLMProviderModelRequestDto requestDto)
    {
        return ResultHelper(await _llmProviderService.GetAllModelsAsync(requestDto));
    }
}
