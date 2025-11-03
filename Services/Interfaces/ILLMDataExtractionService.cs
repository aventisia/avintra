namespace AspNetToolkit.Services;

/// <summary>
/// Service for extracting text and data from documents using a language model (LLM).
/// </summary>
public interface ILLMDataExtractionService
{
    /// <summary>
    /// Determines whether the user has sufficient credits to perform the requested operation.
    /// </summary>
    /// <returns>
    /// A <see cref="Task{TResult}"/> that represents the asynchronous operation. 
    /// The task result contains a <see cref="ServiceResponse{Boolean}"/> indicating whether sufficient credits are available.
    /// </returns>
    Task<ServiceResponse<bool>> HasSufficientCreditsAsync();

    /// <summary>
    /// Sends text to an LLM with a prompt and returns the result as plain text.
    /// </summary>
    /// <param name="prompt">The prompt or question for the LLM.</param>
    /// <param name="llmModel">The LLM model to use.</param>
    /// <param name="modelTemperature">Controls how focused or creative the response is (0–1).</param>
    /// <returns>The LLM’s response as text.</returns>
    Task<ServiceResponse<string>> ExtractDataAsync(string prompt, string llmModel, double modelTemperature, UsageSourceTypesEnum refType, Guid refId, string refName, ActionTypesEnum actionType, string? triggeredByAgent, object? ollamaOutputFormatSchema = null, bool isJsonOutput = true);

    /// <summary>
    /// Extracts plain text from a file at the given URL.
    /// </summary>
    /// <param name="fileUrl">The URL of the file.</param>
    /// <returns>The extracted text.</returns>
    Task<string> GetFileTextAsync(string fileUrl);
}