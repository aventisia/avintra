namespace MLModelBuilderAPIs.Services;

public interface ILLMService
{
    /// <summary>
    /// Get a list of all LLMs
    /// </summary>
    /// <returns>List of LLMs</returns>
    Task<ServiceResponse<IEnumerable<LLMDto>>> GetAllLLMsAsync();

    /// <summary>
    /// Checks availability of LLM name 
    /// </summary>
    /// <param name="checkAvailabilityDto">Check Availability Dto</param>
    /// <returns>True if LLM name is unique, else false</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsLLMNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Insert a LLM
    /// </summary>
    /// <param name="llmDto"> LLM Dto</param>
    /// <returns>A new LLM</returns>
    Task<ServiceResponse<LLMDto>> InsertLLMAsync(LLMDto llmDto);

    /// <summary>
    /// Update a LLM
    /// </summary>
    /// <param name="llmDto">LLM Dto</param>
    /// <returns>An updated LLM</returns>
    Task<ServiceResponse<LLMDto>> UpdateLLMAsync(LLMDto llmDto);

    /// <summary>
    /// Delete a LLM
    /// </summary>
    /// <param name="id">LLM Identifier</param>
    /// <returns>True if the deletion is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteLLMAsync(Guid id);

    /// <summary>
    /// Get a LLM by identifier
    /// </summary>
    /// <param name="id">LLM Identifier</param>
    /// <returns>A LLM with specific identifier</returns>
    Task<ServiceResponse<LLMDto>> GetLLMByIdAsync(Guid id);
}