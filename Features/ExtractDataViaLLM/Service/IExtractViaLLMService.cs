namespace MLModelBuilderAPIs.Services;

public interface IExtractViaLLMService
{
    /// <summary>
    /// Extracts data via a Language Learning Model (LLM) asynchronously.
    /// </summary>
    /// <param name="extractRequestDto">The request data transfer object containing the parameters for extraction.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response with an enumerable of extraction response DTOs.</returns>
    Task<ServiceResponse<ExtractResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto);
}