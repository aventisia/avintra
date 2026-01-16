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
    /// Sends a prompt to a large language model (LLM) and retrieves the generated output as plain text.
    /// </summary>
    /// <param name="llmRequest">The request containing the prompt, model details, and configuration settings for the LLM.</param>
    /// <returns>A <see cref="ServiceResponse{string}"/> containing the LLM’s generated text response.</returns>
    Task<ServiceResponse<string>> ExtractDataAsync(LLMRequest llmRequest);

    /// <summary>
    /// Extracts plain text from a file at the given URL.
    /// </summary>
    /// <param name="fileUrl">The URL of the file.</param>
    /// <returns>The extracted text.</returns>
    Task<string> GetFileTextAsync(string fileUrl);
}